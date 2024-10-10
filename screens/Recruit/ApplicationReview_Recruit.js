import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import colors from "../../assets/colors";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect } from "@react-navigation/native";

const ApplicationReview_Recruit = ({ route, navigation }) => {
  const { applicationData } = route.params;
  const [internData, setInternData] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      setInternData(applicationData);
    }, [applicationData])
  );

  const handleAcceptPress = async () => {
    if (internData) {
      const docRef = doc(db, "applications", internData.id);
      await updateDoc(docRef, {
        status: "Accepted",
      });
      console.log("Application accepted");
    }
  };

  const handleRejectPress = async () => {
    if (internData) {
      const docRef = doc(db, "applications", internData.id);
      await updateDoc(docRef, {
        status: "Rejected",
      });
      console.log("Application rejected");
    }
  };

  const handleScheduleInterviewPress = async () => {
    navigation.navigate("InterviewRecruit", {
      // Pass any required parameters here
      internData: internData,
    });
  };

  const handleUpdateInterviewPress = async () => {
    navigation.navigate("InterviewUpdateRecruit", {
      // Pass any required parameters here
      interviewId: internData.interviewId,
    });
  };

  const handleDownloadCVPress = async (cvUrl) => {
    Linking.openURL(cvUrl);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Applied":
        return {
          color: colors.status.applied.text,
          backgroundColor: colors.status.applied.background,
          padding: 8,
          borderRadius: 10,
        };
      case "In Review":
        return {
          color: colors.status.inReview.text,
          backgroundColor: colors.status.inReview.background,
          padding: 8,
          borderRadius: 10,
        };
      case "Accepted":
        return {
          color: colors.status.accepted.text,
          backgroundColor: colors.status.accepted.background,
          padding: 8,
          borderRadius: 10,
        };
      case "Rejected":
        return {
          color: colors.status.rejected.text,
          backgroundColor: colors.status.rejected.background,
          padding: 8,
          borderRadius: 10,
        };
      default:
        return {
          color: colors.status.applied.text,
          backgroundColor: colors.status.applied.background,
          padding: 8,
          borderRadius: 10,
        };
    }
  };

  const getInternName = () => {
    return internData.intern?.fullName;
  };

  const getInternEmail = () => {
    return internData.intern?.email;
  };

  const getInternPhone = () => {
    return internData.intern?.mobileNumber;
  };

  const getInternStatus = () => {
    return internData.status;
  };

  const getInternProfilePicture = () => {
    return internData.intern?.profilePicture;
  };

  const getStatusText = () => {
    const status = getInternStatus();
    const statusStyle = getStatusStyle(status);
    return <Text style={statusStyle}>{status}</Text>;
  };

  const getStatusContainerStyle = () => {
    const status = getInternStatus();
    const statusStyle = getStatusStyle(status);
    return {
      ...styles.statusText,
      ...statusStyle,
    };
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Application Review</Text>
        <Text></Text>
      </View>
      <View style={styles.info}>
        <Image
          source={{ uri: getInternProfilePicture() }}
          style={styles.profilePicture}
        />
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{getInternName()}</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{getInternEmail()}</Text>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{getInternPhone()}</Text>
      </View>

      <View style={styles.status}>
        <Text style={getStatusContainerStyle()}>Status: {getStatusText()}</Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={handleRejectPress}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAcceptPress}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        {getInternStatus() === "In Review" ? (
          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={handleUpdateInterviewPress}
          >
            <Text style={styles.buttonText}>Update Interview</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={handleScheduleInterviewPress}
          >
            <Text style={styles.buttonText}>Schedule Interview</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => handleDownloadCVPress(internData.intern?.cvUrl)}
        >
          <Text style={styles.buttonText}>Download CV</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginBottom: 20,
    width: "100%",
    marginTop: 20,
  },
  backButton: {
    zIndex: 100, // Ensure the icon is on top
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 20,
    color: colors.primary,
    marginLeft: 20,
  },
  info: {
    marginBottom: 20,
    alignItems: "center",
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 5,
    color: colors.primary,
  },
  value: {
    fontSize: 18,
    fontFamily: "Poppins-Regular",
    marginBottom: 20,
    color: colors.primary,
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    marginLeft: 10,
  },
  statusValue: {
    fontSize: 18,
    fontFamily: "Poppins-Regular",
  },
  buttons: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  acceptButton: {
    backgroundColor: colors.green,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: "48%",
  },
  rejectButton: {
    backgroundColor: colors.lightred,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: "48%",
  },
  scheduleButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 20,
    width: "48%",
  },
  downloadButton: {
    backgroundColor: colors.primary,
    padding: 10,
    height: 50,
    marginTop: 20,
    borderRadius: 10,
    marginBottom: 10,
    width: "48%",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: colors.white,
    textAlign: "center",
  },
});

export default ApplicationReview_Recruit;
