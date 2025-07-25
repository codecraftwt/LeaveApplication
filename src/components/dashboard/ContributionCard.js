import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { p } from '../../utils/Responsive';
import Feather from 'react-native-vector-icons/Feather';
import { Svg, Circle, Text as SVGText } from 'react-native-svg';
import { useSelector } from 'react-redux';

const CircularProgress = (props) => {
  const { size, strokeWidth, text } = props;
  const radius = (size - strokeWidth) / 2;
  const circum = radius * 2 * Math.PI;
  const svgProgress = 100 - props.progressPercent;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle 
          stroke={props.bgColor ? props.bgColor : "#8ca5ff"}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          {...{strokeWidth}}
        />
        
        {/* Progress Circle */}
        <Circle 
          stroke={props.pgColor ? props.pgColor : "#ffd700"}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={`${circum} ${circum}`}
          strokeDashoffset={radius * Math.PI * 2 * (svgProgress/100)}
          strokeLinecap="round"
          transform={`rotate(-90, ${size/2}, ${size/2})`}
          {...{strokeWidth}}
        />

        {/* Text */}
        <SVGText
          fontSize={props.textSize ? props.textSize : "18"}
          x={size / 2}
          y={size / 2 + (props.textSize ?  (props.textSize / 3) : 6)}
          textAnchor="middle"
          fill={props.textColor ? props.textColor : "#fff"}
          fontFamily="Poppins-Bold"
        >
          {text}
        </SVGText>
      </Svg>
    </View>
  );
};

export default function ContributionCard() {
  const dashboard = useSelector(state => state.auth.dashboard);
  const billable_hrs = dashboard?.billable_hrs || 0;
  const target = 1800;
  // Use prop instead of hardcoded value
  const percentage = Math.min((billable_hrs / target) * 100, 100);
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.text}>Your Contribution {currentYear}</Text>
          <Feather
            style={[styles.icon, {transform: [{rotate: '-20deg'}]}]}
            name="arrow-up-right"
            size={p(15)}
            color="white"
          />
        </View>

        <Text style={styles.hrs}>{billable_hrs}</Text>
        <Text style={styles.billtext}>Billable hours</Text>
      </View>
      
      <View style={styles.progressCircleContainer}>
        <View style={styles.progressWrapper}>
          <CircularProgress
            size={p(100)}
            strokeWidth={p(10)}
            progressPercent={percentage}
            text={`${Math.round(percentage)}%`}
            bgColor="#8ca5ff"
            pgColor="#ffd700"
            textColor="#fff"
            textSize={p(18)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#3660f9',
    borderRadius: p(10),
    paddingVertical: p(15),
    paddingHorizontal: p(20),
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  text: {
    fontSize: p(14),
    color: '#fff',
    fontFamily: 'Montserrat-Regular',
    paddingRight: p(5),
  },
  hrs: {
    fontSize: p(30),
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    marginTop: p(5),
  },
  billtext: {
    fontSize: p(14),
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    marginTop: p(2),
  },
  progressCircleContainer: {
    alignItems: 'flex-end',
  },
  progressWrapper: {
    width: p(100),
    height: p(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    padding: p(2),
    backgroundColor: '#ffa620',
    borderRadius: p(30),
    marginLeft: p(5),
  },
});