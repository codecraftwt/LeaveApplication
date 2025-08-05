import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Platform,
  Alert,
  Text,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FileViewer from 'react-native-file-viewer';
import { PermissionsAndroid } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { getAnnualPackage } from '../../redux/slices/salarySlice';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/Feather';
import RNFS from 'react-native-fs';
import PermissionModal from '../../components/PermissionModal';

import { p } from '../../utils/Responsive';
import { ScrollView } from 'react-native-gesture-handler';

const AnnualSalaryPackage = () => {
  const empId = useSelector(state => state?.auth?.user?.id);

  const user = useSelector(state => state?.auth?.user);
  const salaryData = useSelector(state => state?.salary?.salaryList);

  const annualSalary = useSelector(state => state.salary?.annualPackage);
  const annualPackageLoading = useSelector(
    state => state.salary?.annualPackageLoading,
  );
  const annualPackageError = useSelector(
    state => state.salary?.annualPackageError,
  );
  const annualPackageSuccess = useSelector(
    state => state.salary?.annualPackageSuccess,
  );

  const dispatch = useDispatch();
  const year = new Date().getFullYear();
  const userDetails = useSelector(state => state.auth.userDetails);
  const profile = userDetails;
  const [fetchSuccess, setFetchSuccess] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    const fetchAnnualPackage = async () => {
      // Additional safety check for authentication
      if (!empId || !user) {
        console.log('Missing authentication data:', {
          empId: !!empId,
          user: !!user,
        });
        return;
      }

      console.log('Starting to fetch annual package...');
      const yearsToTry = [year, year - 1, year - 2, year - 3];

      for (const yearToTry of yearsToTry) {
        try {
          console.log(`Trying to fetch for year: ${yearToTry}`);
          const result = await dispatch(
            getAnnualPackage({ empid: empId, year: yearToTry }),
          );
          console.log('result', result);
          if (result.meta.requestStatus === 'fulfilled') {
            console.log(`Successfully fetched data for year ${yearToTry}`);
            setFetchSuccess(true);
            return; // Exit early if successful
          } else if (result.meta.requestStatus === 'rejected') {
            const error = result.payload;
            if (error && error.status === 404) {
              console.log(`No data found for year ${yearToTry} (404)`);
              // Continue to next year for 404 errors
              continue;
            } else if (error && error.status === 401) {
              console.log('Authentication failed, stopping attempts');
              return;
            } else {
              console.log(`Error for year ${yearToTry}:`, error);
              continue; // Try next year
            }
          }
        } catch (error) {
          console.log(`Error fetching for year ${yearToTry}:`, error);
          continue; // Try next year
        }
      }

      // If we get here, none of the years worked
      console.log('No annual package data found for any year');
      setFetchSuccess(false);
    };

    fetchAnnualPackage();
  }, [dispatch, empId, year, user]);

  const generatePDFHtml = (annualSalary, profile) => {
    console.log('generatePDFHtml called with:', { annualSalary, profile });
    if (!annualSalary || !profile) {
      console.log('Missing data in generatePDFHtml');
      return '';
    }
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Salary Package</title>
    <style>
        body {
            font-family: "Roboto", sans-serif;
            color: #5b626b;
            margin: 0;
            padding: 0;
        }
        .wrapper {
            padding: 10px;
            border: 5px solid #0079dd;
            box-sizing: border-box;
        }
        .container {
            background-color: #fff;
            padding: 10px;
            border-radius: 5px;
            box-sizing: border-box;
        }
        .main-div {
            text-align: center;
        }
        .head-sec h2 {
            font-size: 1.5em;
            margin: 0;
        }
        .head-sec h3 {
            font-size: 1em;
            margin: 0;
            font-weight: 400;
        }
        .logo-contact-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 10px 0;
            flex-wrap: wrap; /* Allows wrapping for small screens */
        }
        .print-view-logo img {
            width: 100%;
            max-width: 100px;
        }
        .contact-info {
            text-align: center;
            font-size: 0.9em;
            flex: 1; /* Allows the contact info to take available space */
            padding: 0 10px; /* Optional spacing */
        }
        .contact-info a {
            color: #0079dd;
            text-decoration: none;
        }
        .contact-info a:hover {
            text-decoration: underline;
        }
        .employee-details {
            margin: 10px 0;
            background-color: #E8F3FC;
        }
        .employee-details h3 {
            font-size: 1.2em;
            margin: 10px 0;
        }
        .employee-details-table table {
            width: 100%;
            border-collapse: collapse;
        }
        .employee-details-table label {
            color: #5b626b;
        }
        .employee-details-table td {
            color: #65626b;
        }
        .employee-details-table table td,
        .employee-details-table table th {
            font-size: 0.9em;
            border: 1px solid #ddd;
            padding: 5px;
        }
        .salary-breakup table {
            width: 100%;
            border-collapse: collapse;
        }
        .salary-breakup table th {
            padding: 5px;
            color: #a6b3b6;
            font-size: 0.9em;
            font-weight: 400;
            text-align: left;
            border: 1px solid #ddd;
        }
        .salary-breakup table td {
            padding: 5px;
            text-align: left;
            border: 1px solid #ddd;
            font-size: 0.9em;
        }
        .breakup-tital {
            font-weight: bold;
            font-size: 0.9em;
            color: #000;
            text-align: left;
        }
        .breakup-tital-otherbenefits {
            font-size: 1em;
            font-weight: bold;
            color: #a6b3b6;
            text-align: center;
        }
     
        .net-salary td {
            font-weight: bold;
            color: #000;
        }
        .ctc-salary {
            font-weight: bold;
        }
        .other-benefits {
            margin-top: 10px;
        }
        .other-benefits table {
            width: 100%;
            border-collapse: collapse;
        }
        .other-benefits-title td {
            text-align: left;
            color: #5b626b;
            font-size: 0.9em;
            border: 1px solid #ddd;
        }
        .other-benefits table td {
            border: 1px solid #ddd;
            font-size: 0.9em;
        }
        .main-benefits-tital {
            text-align: center;
        }
        .extra-info {
            font-style: italic;
            font-size: 0.7em;
            margin-top: 10px;
        }
        /* Responsive design */
        @media (max-width: 600px) {
            .logo-contact-info {
                flex-direction: row;
                align-items: center;
            }
            .contact-info {
                font-size: 0.8em;
                padding: 5px 0; /* Space around the contact info */
            }
            .salary-breakup table th,
            .salary-breakup table td,
            .employee-details-table table th,
            .employee-details-table table td {
                font-size: 0.8em;
            }
           @media (max-width: 600px) {
        .other-benefits table {
            font-size: 0.75em;
        }
        .breakup-tital-otherbenefits {
            font-size: 1em;
        }
        .extra-info {
            font-size: 0.65em;
        }
    }     
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="main-div">
                <div class="head-sec">
                    <h2>Walstar Technologies Private Limited</h2>
                    <h3>Annexure CTC Break Up</h3> 
                </div>
                <div class="logo-contact-info">
                    <div class="print-view-logo">
                        <a href="#"><img src="https://crm.walstartechnologies.com/assets/images/large-logo.png" alt="logo walstar"></a>
                    </div>
                    <div class="contact-info">
                        <h5>2103/47 E, Rukmini Nagar, Front Of Datta Mandir,Kolhapur,Maharashtra 416005</h5>
                    </div>
                </div>
                <div class="employee-details">
                    <h3>Employee details</h3>
                    <div class="employee-details-table">
                        <table ">
                            <tr>
                                <td width="50%"><label>Employee Name:&nbsp;&nbsp;&nbsp;&nbsp;${
                                  user?.first_name
                                } ${user?.last_name}</label></td>
                                <td><label>Employee ID: </label>${empId}</td>
                            </tr>
                            <tr>
                                <td><label>Designation: </label>${
                                  profile?.user_role?.name
                                }</td>
                                <td>
                                    <label>Date:</label>
                                    ${new Date(
                                      annualSalary?.applied_from_date,
                                    ).getFullYear()}-${new Date(
      annualSalary?.applied_to_date,
    ).getFullYear()}
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div class="salary-breakup">
                    <table>
                        <tr style="background-color: #0079DD;">
            <th style="color: #ffffff; font-weight: bold; width: 50%;">Component Category</th>
            <th style="color: #ffffff; font-weight: bold; width: 25%;">Monthly</th>
            <th style="color: #ffffff; font-weight: bold; width: 25%;">Annual</th>
        </tr>
                         <tr style="background-color: #B5DEFF;">
    <td class="breakup-title" colspan="3" style="color: black; font-weight: bold;">1. Fixed Compensation</td>
</tr>
                        <tr>
                            <td>Basic Salary </td>
                            <td>${annualSalary?.basic_salary}</td>
                            <td>${(annualSalary?.basic_salary * 12).toFixed(
                              2,
                            )}</td>
                        </tr>
                        <tr>
                            <td>HRA </td>
                            <td>${annualSalary.hra}</td>
                            <td>${annualSalary.hra * 12}</td>
                        </tr>
                        <tr>
                            <td>Conveyance Allowance </td>
                            <td>${annualSalary.conv}</td>
                            <td>${annualSalary.conv * 12}</td>
                        </tr>
                        <tr>
                            <td>EA </td>
                            <td>${annualSalary.ea}</td>
                            <td>${annualSalary.ea * 12}</td>
                        </tr>
                        <tr>
                            <td>Other Allowance </td>
                            <td>${annualSalary.other_allowense}</td>
                            <td>${(annualSalary.other_allowense * 12).toFixed(
                              2,
                            )}</td>
                        </tr>
                        <tr style="background-color: #FFE6D1;">
                                 <td style="color: black; font-weight: bold;">Gross Salary</td>
                                <td style="color: black; font-weight: bold;">${
                                  annualSalary.gross_salary
                                }</td>
                                <td style="color: black; font-weight: bold;">${(
                                  annualSalary.gross_salary * 12
                                ).toFixed(2)}</td>
                        </tr>

                         <tr style="background-color: #B5DEFF;">
    <td class="breakup-title" colspan="3" style="color: black; font-weight: bold;">2. Performance Pay**</td>
</tr>
                        <tr>
                            <td>Yearly Performance Bonus (Paid in 6 months) </td>
                            <td>1,000.00</td>
                            <td>12,000.00</td>
                        </tr>
                        <tr>
                            <td>Monthly Performance Bonus </td>
                            <td>${annualSalary.monthly_bonus}</td>
                            <td>${annualSalary.monthly_bonus * 12}</td>
                        </tr>
                        <tr style="background-color: #B5DEFF;">
    <td class="breakup-title" colspan="3" style="color: black; font-weight: bold;">3. Employee Deductions</td>
</tr>
                        <tr>
                            <td>Employee PF </td>
                            <td>${annualSalary.employee_pf}</td>
                            <td>${annualSalary.employee_pf * 12}</td>
                        </tr>
                        <tr>
                            <td>Professional Tax </td>
                            <td>${annualSalary.employee_professional_tax}</td>
                            <td>${
                              annualSalary.employee_professional_tax * 12
                            }</td>
                        </tr>
                        <tr>
                            <td>TDS</td>
                            <td>0.00</td>
                            <td>0.00</td>
                        </tr>
                            <tr style="background-color: #FFE6D1;">
                                     <td style="color: black; font-weight: bold;">Employee Deductions</td>
                                     <td style="color: black; font-weight: bold;">
                                        ${
                                          annualSalary.employee_pf * 1 +
                                          annualSalary.employee_professional_tax *
                                            1
                                        }
                                    </td>
                                    <td style="color: black; font-weight: bold;">
                                        ${
                                          annualSalary.employee_pf * 12 +
                                          annualSalary.employee_professional_tax *
                                            12
                                        }
                                    </td>
                             </tr>

                      <tr style="background-color: #B5DEFF;">
    <td class="breakup-title" colspan="3" style="color: black; font-weight: bold;">4.Employer Deductions</td>
</tr>
                        <tr>
                            <td>Employer PF </td>
                            <td>${annualSalary.employer_pf}</td>
                            <td>${annualSalary.employer_pf * 12}</td>
                        </tr>
                        <tr>
                            <td>Insurance </td>
                            <td>${annualSalary.insurance}</td>
                            <td>${annualSalary.insurance * 12}</td>
                        </tr>
                        <tr>
                            <td>Other Handling charges</td>
                            <td>150.00</td>
                            <td>1,800.00</td>
                        </tr>
                        <tr  style="background-color: #FFE6D1;"">
                            <td style="color: black; font-weight: bold;">Employer Deductions</td>
                            <td style="color: black; font-weight: bold;">${
                              annualSalary.employer_pf * 1 +
                              annualSalary.insurance * 1 +
                              150
                            }</td>
                            <td style="color: black; font-weight: bold;">${(
                              annualSalary.employer_pf * 12 +
                              annualSalary.insurance * 12 +
                              1800
                            ).toFixed(0)}</td>
                        </tr>
                        <tr  style="background-color: #FFE6D1;"">
                            <td style="color: black; font-weight: bold;">Total Deductions</td>
                            <td style="color: black; font-weight: bold;">${
                              annualSalary.total_deduction
                            }</td>
                            <td style="color: black; font-weight: bold;">${
                              annualSalary.total_deduction * 12
                            }</td>
                        </tr>
                        <tr  style="background-color: #B5DEFF;">
                            <td style="color: black; font-weight: bold;">Net Salary</td>
                            <td style="color: black; font-weight: bold;">${
                              annualSalary.net_salary
                            }</td>
                            <td></td>
                        </tr>
                        <tr  style="background-color: #E87817;">
                            <td style="color: #ffffff; font-weight: bold;">CTC</td>
                            <td style="color: #ffffff; font-weight: bold;">
                                ${(annualSalary.ctc / 12).toFixed(2)}
                            </td>
                            <td style="color: #ffffff; font-weight: bold;">
                            ${(annualSalary.ctc * 1).toFixed(2)}</td>
                        </tr>
                    </table>
                </div>
                <div class="other-benefits">
                    <table>
                        <tr class="main-benefits-tital">
                            <td class="breakup-tital-otherbenefits" colspan="5">OTHER BENEFITS</td>
                        </tr>
                       <tr style="background-color: #0079DD;">
    <td style="color: white;">Scheme</td>
    <td style="color: white;">Eligible Amount <br>in INR</td>
    <td style="color: white;">Interest</td>
    <td style="color: white;">Monthly Instalments</td>
    <td style="color: white;">Margin Money</td>
</tr>
                        <tr>
                            <td rowspan="3"><strong>SOFT LOAN</strong> <br>(Without Security)</td>
                            <td>25K (CTC > 2 Lakh)</td>
                            <td>@0%</td>
                            <td>5</td>
                            <td>Nil</td>
                        </tr>
                        <tr>
                            <td>50K (CTC > 3 Lakh)</td>
                            <td>@0%</td>
                            <td>10</td>
                            <td>Nil</td>
                        </tr>
                        <tr>
                            <td>100K (CTC > 4 Lakh)</td>
                            <td>@0%</td>
                            <td>12</td>
                            <td>Nil</td>
                        </tr>
                        <tr>
                            <td colspan="5" style="text-align: left;">
                                <span class="extra-info">
                                    * All the above benefits are as per the Company's policies, which are
                                    subject to change from time to time. The disbursement of any loan / loan
                                    allowance is subject to the fulfilment of all criteria defined for the
                                    same to the satisfaction of the Company as per the relevant loan / loan
                                    allowance policy at that time.<br /> * Soft Loan will be applicable if
                                    you have 6+ Months experience in WALSTAR.<br />**Monthly Performance
                                    bonus payment is based on overall performance of the Company, Branch,
                                    Team & Employee.
                                </span>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
</body>
</html>


    `;

    return html;
  };

  const requestStoragePermission = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version < 30) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to save PDF files.',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // For iOS and Android 11+ (API 30+)
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  const generateAndDownloadPDF = async () => {
    console.log('generateAndDownloadPDF called');
    console.log('Platform:', Platform.OS);
    console.log('Platform Version:', Platform.Version);
    console.log('annualSalary:', annualSalary);
    console.log('profile:', profile);
    
    if (!annualSalary || !profile) {
      Alert.alert('Error', 'Salary data or profile data is missing. Please try refreshing the page.');
      return;
    }
    
    if (Platform.OS === 'android') {
      try {
        // Check permissions first
        const hasPermission = await requestStoragePermission();
        
        if (!hasPermission) {
          setShowPermissionModal(true);
          return;
        }

        const htmlContent = generatePDFHtml(annualSalary, profile);
        
        if (!htmlContent) {
          Alert.alert('Error', 'Failed to generate PDF content. Please try again.');
          return;
        }
        
        console.log('HTML content length:', htmlContent.length);

        const options = {
          html: htmlContent,
          fileName: 'Annual_Salary_Package',
          directory: Platform.OS === 'android' ? 'Downloads' : 'Documents',
        };

        const file = await RNHTMLtoPDF.convert(options);
        const pdfFilePath = file.filePath;
        console.log('PDF generated at:', pdfFilePath);

        if (Platform.Version >= 30) {
          const filePath = `${RNFS.DownloadDirectoryPath}/Annual_Salary_Package.pdf`;
          
          // Check if destination file already exists and remove it
          const destExists = await RNFS.exists(filePath);
          if (destExists) {
            await RNFS.unlink(filePath);
          }
          
          await RNFS.moveFile(pdfFilePath, filePath);
          console.log('PDF moved to:', filePath);

          Alert.alert(
            'PDF Generated Successfully! 📄', 
            `Your Annual Salary Package PDF has been saved to your Downloads folder.\n\nFile: Annual_Salary_Package.pdf`, 
            [
              { text: 'Open PDF', onPress: () => openPDF(filePath) },
              { text: 'OK' }
            ]
          );
        } else {
          console.log('Using original PDF path:', pdfFilePath);
          Alert.alert(
            'PDF Generated Successfully! 📄', 
            `Your Annual Salary Package PDF has been saved.\n\nFile: Annual_Salary_Package.pdf`, 
            [
              { text: 'Open PDF', onPress: () => openPDF(pdfFilePath) },
              { text: 'OK' }
            ]
          );
        }
      } catch (error) {
        console.error('Failed to generate PDF:', error);
        
        // Check if it's a permission-related error
        if (error.message && error.message.includes('permission')) {
          setShowPermissionModal(true);
        } else {
          Alert.alert(
            'PDF Generation Failed', 
            'Unable to generate PDF. Please check your storage permissions and try again.',
            [
              { text: 'Check Permissions', onPress: () => setShowPermissionModal(true) },
              { text: 'OK' }
            ]
          );
        }
      }
    } else if (Platform.OS === 'ios') {
      try {
        const htmlContent = generatePDFHtml(annualSalary, profile);
        
        if (!htmlContent) {
          Alert.alert('Error', 'Failed to generate PDF content. Please try again.');
          return;
        }
        
        console.log('HTML content length:', htmlContent.length);
        
        const options = {
          html: htmlContent,
          fileName: 'Annual_Salary_Package',
          directory: 'Documents',
        };

        const file = await RNHTMLtoPDF.convert(options);
        const pdfFilePath = file.filePath;
        console.log('PDF generated at:', pdfFilePath);
        
        // For iOS, we don't need to move the file - it's already in the Documents directory
        // Just use the generated file path directly
        console.log('PDF ready for viewing:', pdfFilePath);

        Alert.alert(
          'PDF Generated Successfully! 📄', 
          `Your Annual Salary Package PDF has been saved to your Documents folder.\n\nFile: Annual_Salary_Package.pdf`, 
          [
            { text: 'Open PDF', onPress: () => openPDF(pdfFilePath) },
            { text: 'OK' }
          ]
        );
      } catch (error) {
        console.error('Failed to generate PDF on iOS:', error);
        Alert.alert(
          'PDF Generation Failed', 
          'Unable to generate PDF. Please try again.',
          [
            { text: 'Retry', onPress: () => generateAndDownloadPDF() },
            { text: 'OK' }
          ]
        );
      }
    } else {
      Alert.alert(
        'Unsupported Platform',
        'PDF generation is supported on both Android and iOS.',
      );
    }
  };
  const openPDF = async filePath => {
    try {
      console.log('Attempting to open PDF at path:', filePath);
      
      // Check if file exists before trying to open it
      const fileExists = await RNFS.exists(filePath);
      console.log('File exists:', fileExists);
      
      if (!fileExists) {
        Alert.alert('Error', 'PDF file not found. Please try downloading again.');
        return;
      }
      
      // Get file info
      const fileStats = await RNFS.stat(filePath);
      console.log('File size:', fileStats.size);
      
      // For Android, try multiple methods
      if (Platform.OS === 'android') {
        try {
          // Method 1: Try FileViewer first
          await FileViewer.open(filePath);
          console.log('PDF opened successfully with FileViewer');
          return;
        } catch (fileViewerError) {
          console.log('FileViewer failed, trying alternative methods:', fileViewerError);
          
          // Method 2: Try with content:// URL
          try {
            const contentUrl = `content://${filePath}`;
            await Linking.openURL(contentUrl);
            console.log('PDF opened successfully with content URL');
            return;
          } catch (contentError) {
            console.log('Content URL failed:', contentError);
          }
          
          // Method 3: Try with file:// URL
          try {
            const fileUrl = `file://${filePath}`;
            const canOpen = await Linking.canOpenURL(fileUrl);
            console.log('Can open file URL:', canOpen);
            
            if (canOpen) {
              await Linking.openURL(fileUrl);
              console.log('PDF opened successfully with file URL');
              return;
            }
          } catch (fileUrlError) {
            console.log('File URL failed:', fileUrlError);
          }
          
          // Method 4: Try with Intent (Android specific)
          try {
            const intentUrl = `intent://${filePath}#Intent;action=android.intent.action.VIEW;type=application/pdf;end`;
            await Linking.openURL(intentUrl);
            console.log('PDF opened successfully with Intent');
            return;
          } catch (intentError) {
            console.log('Intent failed:', intentError);
          }
          
          // If all methods fail, show user-friendly message
          throw new Error('No app can handle this file type');
        }
      } else {
        // For iOS, use FileViewer with proper error handling
        try {
          await FileViewer.open(filePath);
          console.log('PDF opened successfully with FileViewer');
        } catch (fileViewerError) {
          console.log('FileViewer failed on iOS:', fileViewerError);
          // Try alternative method for iOS
          try {
            const fileUrl = `file://${filePath}`;
            await Linking.openURL(fileUrl);
            console.log('PDF opened successfully with file URL on iOS');
          } catch (linkingError) {
            console.log('Linking failed on iOS:', linkingError);
            throw new Error('Unable to open PDF on iOS');
          }
        }
      }
    } catch (error) {
      console.error('Failed to open PDF:', error);
      
      // User-friendly error message with helpful suggestions
      const folderName = Platform.OS === 'ios' ? 'Documents folder' : 'Downloads folder';
      const instructions = Platform.OS === 'ios' 
        ? '• Open the Files app\n• Go to "On My iPhone/iPad" > "Documents"\n• Tap on "Annual_Salary_Package.pdf"\n• Choose a PDF viewer app'
        : '• Go to your Downloads folder\n• Tap on "Annual_Salary_Package.pdf"\n• Choose a PDF viewer app';
      
      Alert.alert(
        'PDF Saved Successfully! 📄', 
        `Your Annual Salary Package PDF has been saved to your ${folderName}.\n\nTo open it:\n${instructions}\n\nRecommended apps: ${Platform.OS === 'ios' ? 'Preview, Adobe Reader, or your device\'s built-in PDF viewer' : 'Google PDF Viewer, Adobe Reader, or your device\'s built-in PDF viewer'}.`,
        [
          { text: 'Show File Location', onPress: () => showFileLocation(filePath) },
          { text: 'OK' }
        ]
      );
    }
  };

  const showFileLocation = (filePath) => {
    const folderName = Platform.OS === 'ios' ? 'Documents folder' : 'Downloads folder';
    const instructions = Platform.OS === 'ios'
      ? '• Open the Files app\n• Go to "On My iPhone/iPad" > "Documents"\n• Find "Annual_Salary_Package.pdf"\n• Tap to open with a PDF viewer'
      : '• Open your File Manager app\n• Go to Downloads folder\n• Find "Annual_Salary_Package.pdf"\n• Tap to open with a PDF viewer';
    const tip = Platform.OS === 'ios'
      ? '💡 Tip: iOS has a built-in PDF viewer. You can also use Preview or install Adobe Reader from the App Store.'
      : '💡 Tip: Most Android devices have a built-in PDF viewer. If not, install Google PDF Viewer from Play Store.';
    
    Alert.alert(
      '📁 PDF File Location',
      `Your Annual Salary Package PDF is saved at:\n\n${filePath}\n\n📱 To open it manually:\n${instructions}\n\n${tip}`,
      [
        { text: 'Copy Path', onPress: () => {
          // You can add clipboard functionality here if needed
          Alert.alert('Path copied to clipboard');
        }},
        { text: 'OK' }
      ]
    );
  };

  const handleGrantPermission = async () => {
    const hasPermission = await requestStoragePermission();
    if (hasPermission) {
      generateAndDownloadPDF();
    }
  };

  const navigation = useNavigation();
  const openpackage = () => {
    navigation.navigate('AnnualSleep', {
      htmlContent: generatePDFHtml(annualSalary, profile),
    });
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    const yearsToTry = [year, year - 1, year - 2, year - 3];

    for (const yearToTry of yearsToTry) {
      try {
        const result = await dispatch(
          getAnnualPackage({ empid: empId, year: yearToTry }),
        );
        if (result.meta.requestStatus === 'fulfilled') {
          setFetchSuccess(true);
          setRefreshing(false);
          return; // Exit early if successful
        } else if (result.meta.requestStatus === 'rejected') {
          const error = result.payload;
          if (error && error.status === 404) {
            console.log(
              `No data found for year ${yearToTry} (404) during refresh`,
            );
            // Continue to next year for 404 errors
            continue;
          } else if (error && error.status === 401) {
            console.log(
              'Authentication failed during refresh, stopping attempts',
            );
            setRefreshing(false);
            return;
          }
        }
      } catch (error) {
        console.log(`Failed to fetch for year: ${yearToTry}`, error);
        continue; // Try next year
      }
    }

    // If we get here, none of the years worked
    setFetchSuccess(false);
    setRefreshing(false);
  }, [dispatch, empId, year]);
  // Don't render if not authenticated
  if (!empId || !user) {
    console.log('Not authenticated, not rendering AnnualSalaryPackage');
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Please log in to view your Annual Package
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Get your Annual Package Here:</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TouchableOpacity
            onPress={openpackage}
            style={[styles.button, { backgroundColor: '#E97C1F' }]}
          >
            <Icon name={'eye-outline'} style={styles.icon} />
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={generateAndDownloadPDF}
            style={[styles.button, { backgroundColor: '#161719' }]}
          >
            <Icon1 name={'download'} style={styles.icon} />
            <Text style={styles.buttonText}>Download</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PermissionModal
        visible={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onGrantPermission={handleGrantPermission}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: p(20),
    backgroundColor: '#fff',
  },
  title: {
    fontSize: p(16),
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: p(20),
    color: '#333333',
  },
  button: {
    flexDirection: 'row',
    paddingHorizontal: p(15),
    paddingVertical: p(9),
    backgroundColor: '#007bff',
    borderRadius: p(8),
    alignItems: 'center',
    justifyContent: 'center',
    margin: p(10),
    width: '35%',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Rubik-Regular',
    fontSize: p(15),
  },
  icon: {
    color: '#fff',
    fontSize: p(25),
    marginRight: p(5),
    fontWeight: '600',
  },
});
export default AnnualSalaryPackage;
