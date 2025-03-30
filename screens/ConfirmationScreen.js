import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Pressable, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Platform 
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserType } from "../UserContext";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { cleanCart } from "../redux/CartReducer";
import { useNavigation } from "@react-navigation/native";

const ConfirmationScreen = () => {
  const steps = [
    { title: "Address", content: "Address Form" },
    { title: "Delivery", content: "Delivery Options" },
    { title: "Payment", content: "Payment Details" },
    { title: "Order", content: "Order Summary" },
  ];
  
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const cart = useSelector((state) => state.cart.cart);
  const total = cart
    ?.map((item) => item.price * item.quantity)
    .reduce((curr, prev) => curr + prev, 0);
    
  const dispatch = useDispatch();
  const [selectedAddress, setSelectedAddress] = useState("");
  const [option, setOption] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  
  
  useEffect(() => {
    fetchAddresses();
  }, []);
  
  const fetchAddresses = async () => {
    try {
      const response = await axios.get(
        `http://172.16.2.9:8000/addresses/${userId}`
      );
      const { addresses } = response.data;
      setAddresses(addresses);
    } catch (error) {
      console.log("error", error);
    }
  };
  
  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        userId: userId,
        cartItems: cart,
        totalPrice: total,
        shippingAddress: selectedAddress,
        paymentMethod: selectedOption,
      };

      const response = await axios.post(
        "http://172.16.2.9:8000/orders",
        orderData
      );
      if (response.status === 200) {
        navigation.navigate("Order");
        dispatch(cleanCart());
        console.log("order created successfully", response.data);
      } else {
        console.log("error creating order", response.data);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  
  // Function to go back to previous step
  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress Stepper */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepper}>
            {steps?.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                {index > 0 && (
                  <View
                    style={[
                      styles.stepLine,
                      index <= currentStep && styles.activeStepLine,
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.stepCircle,
                    index <= currentStep && styles.activeStepCircle,
                  ]}
                >
                  {index < currentStep ? (
                    <Text style={styles.stepCompletedText}>
                      ✓
                    </Text>
                  ) : (
                    <Text style={styles.stepText}>
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text style={[
                  styles.stepTitle,
                  index === currentStep && styles.activeStepTitle
                ]}>
                  {step.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Address Selection */}
        {currentStep === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Select Delivery Address
            </Text>

            {addresses?.map((item, index) => (
              <Pressable
                key={index}
                style={[
                  styles.addressCard,
                  selectedAddress && selectedAddress._id === item?._id && styles.selectedAddressCard
                ]}
                onPress={() => setSelectedAddress(item)}
              >
                <View style={styles.addressSelectionRow}>
                  {selectedAddress && selectedAddress._id === item?._id ? (
                    <FontAwesome5 name="dot-circle" size={20} color="#008397" />
                  ) : (
                    <Entypo
                      name="circle"
                      size={20}
                      color="gray"
                    />
                  )}

                  <View style={styles.addressDetails}>
                    <View style={styles.addressHeader}>
                      <Text style={styles.addressName}>
                        {item?.name}
                      </Text>
                      <Entypo name="location-pin" size={20} color="#e47911" />
                    </View>

                    <Text style={styles.addressText}>
                      {item?.houseNo}, {item?.landmark}
                    </Text>

                    <Text style={styles.addressText}>
                      {item?.street}
                    </Text>

                    <Text style={styles.addressText}>
                      India, Bangalore
                    </Text>

                    <Text style={styles.addressText}>
                      Phone: {item?.mobileNo}
                    </Text>
                    <Text style={styles.addressText}>
                      PIN: {item?.postalCode}
                    </Text>

                    <View style={styles.addressActions}>
                      <TouchableOpacity style={styles.addressActionButton}>
                        <Text style={styles.actionButtonText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.addressActionButton}>
                        <Text style={styles.actionButtonText}>Remove</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.addressActionButton}>
                        <Text style={styles.actionButtonText}>Set as Default</Text>
                      </TouchableOpacity>
                    </View>

                    {selectedAddress && selectedAddress._id === item?._id && (
                      <TouchableOpacity
                        onPress={() => setCurrentStep(1)}
                        style={styles.primaryButton}
                      >
                        <Text style={styles.primaryButtonText}>
                          Deliver to this Address
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
            
            {addresses?.length === 0 && (
              <View style={styles.emptyState}>
                <Entypo name="location" size={50} color="#d5d5d5" />
                <Text style={styles.emptyStateText}>No addresses found</Text>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Add New Address</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Delivery Options */}
        {currentStep === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Choose your delivery options
            </Text>

            <View style={styles.deliveryOption}>
              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setOption(!option)}
              >
                {option ? (
                  <FontAwesome5 name="dot-circle" size={20} color="#008397" />
                ) : (
                  <Entypo name="circle" size={20} color="gray" />
                )}

                <View style={styles.deliveryDetails}>
                  <Text style={styles.deliveryTitle}>
                    <Text style={styles.highlightText}>
                      Tomorrow by 10pm
                    </Text>
                    {" "}- FREE delivery with your Prime membership
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.deliveryOption}>
              <TouchableOpacity 
                style={styles.radioRow}
                onPress={() => setOption(!option)}
              >
                {!option ? (
                  <FontAwesome5 name="dot-circle" size={20} color="#008397" />
                ) : (
                  <Entypo name="circle" size={20} color="gray" />
                )}

                <View style={styles.deliveryDetails}>
                  <Text style={styles.deliveryTitle}>
                    <Text style={styles.highlightText}>
                      Standard Delivery (3-5 days)
                    </Text>
                    {" "}- FREE delivery on orders above ₹499
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setCurrentStep(2)}
              style={[styles.continueButton, !option && styles.disabledButton]}
              disabled={!option}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Method */}
        {currentStep === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Select your payment method
            </Text>

            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => setSelectedOption("cash")}
            >
              <View style={styles.radioRow}>
                {selectedOption === "cash" ? (
                  <FontAwesome5 name="dot-circle" size={20} color="#008397" />
                ) : (
                  <Entypo name="circle" size={20} color="gray" />
                )}
                <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => setSelectedOption("upi")}
            >
              <View style={styles.radioRow}>
                {selectedOption === "upi" ? (
                  <FontAwesome5 name="dot-circle" size={20} color="#008397" />
                ) : (
                  <Entypo name="circle" size={20} color="gray" />
                )}
                <Text style={styles.paymentOptionText}>Pay with UPI</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => setSelectedOption("card")}
            >
              <View style={styles.radioRow}>
                {selectedOption === "card" ? (
                  <FontAwesome5 name="dot-circle" size={20} color="#008397" />
                ) : (
                  <Entypo name="circle" size={20} color="gray" />
                )}
                <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
              </View>
            </TouchableOpacity>
            {selectedOption && (
              <TouchableOpacity
                onPress={() => setCurrentStep(3)}
                style={styles.continueButton}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Order Summary */}
        {currentStep === 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            <TouchableOpacity style={styles.orderInfoCard}>
              <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoTitle}>
                  Save 5% and never run out
                </Text>
                <MaterialIcons
                  name="keyboard-arrow-right"
                  size={24}
                  color="black"
                />
              </View>
              <Text style={styles.orderInfoSubtitle}>
                Turn on auto deliveries
              </Text>
            </TouchableOpacity>

            <View style={styles.summaryCard}>
              <Text style={styles.deliveryAddressText}>Shipping to {selectedAddress?.name}</Text>

              <View style={styles.divider} />
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Items:</Text>
                <Text style={styles.priceValue}>₹{total}</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Delivery:</Text>
                <Text style={styles.priceValue}>₹0</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Taxes:</Text>
                <Text style={styles.priceValue}>₹{Math.round(total * 0.18)}</Text>
              </View>

              <View style={styles.divider} />
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Order Total:</Text>
                <Text style={styles.totalValue}>
                  ₹{total + Math.round(total * 0.18)}
                </Text>
              </View>
            </View>

            <View style={styles.paymentInfoCard}>
              <Text style={styles.paymentInfoLabel}>Pay With:</Text>
              <Text style={styles.paymentInfoValue}>
                {selectedOption === "cash" 
                  ? "Pay on delivery (Cash)" 
                  : selectedOption === "upi" 
                    ? "UPI Payment"
                    : "Card Payment"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handlePlaceOrder}
              style={styles.placeOrderButton}
            >
              <Text style={styles.placeOrderButtonText}>Place your order</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConfirmationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stepperContainer: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  stepper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepLine: {
    position: "absolute",
    height: 2,
    width: "100%",
    backgroundColor: "#D0D0D0",
    top: 14,
    left: -50,
    zIndex: 1,
  },
  activeStepLine: {
    backgroundColor: "#008397",
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#D0D0D0",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  activeStepCircle: {
    backgroundColor: "#008397",
  },
  stepText: {
    color: "white",
    fontWeight: "bold",
  },
  stepCompletedText: {
    color: "white",
    fontWeight: "bold",
  },
  stepTitle: {
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
    color: "#707070",
  },
  activeStepTitle: {
    color: "#008397",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  selectedAddressCard: {
    borderColor: "#008397",
    backgroundColor: "#f9f9f9",
  },
  addressSelectionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  addressDetails: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  addressActions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  addressActionButton: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  actionButtonText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginVertical: 15,
  },
  primaryButton: {
    backgroundColor: "#008397",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "500",
  },
  secondaryButton: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#008397",
  },
  secondaryButtonText: {
    color: "#008397",
    fontWeight: "500",
  },
  deliveryOption: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "white",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  deliveryDetails: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 14,
    color: "#333",
  },
  highlightText: {
    color: "#008397",
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#FFC72C",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
    borderColor: "#D0D0D0",
    borderWidth: 1,
  },
  continueButtonText: {
    fontWeight: "500",
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "white",
  },
  paymentOptionText: {
    fontSize: 15,
    fontWeight: "500",
  },
  orderInfoCard: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "white",
  },
  orderInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  orderInfoSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "white",
  },
  deliveryAddressText: {
    fontSize: 14,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  priceLabel: {
    fontSize: 15,
    color: "#666",
  },
  priceValue: {
    fontSize: 15,
    color: "#666",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C60C30",
  },
  paymentInfoCard: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "white",
  },
  paymentInfoLabel: {
    fontSize: 14,
    color: "#666",
  },
  paymentInfoValue: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 5,
  },
  placeOrderButton: {
    backgroundColor: "#FFC72C",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  placeOrderButtonText: {
    fontWeight: "bold",
  },
});