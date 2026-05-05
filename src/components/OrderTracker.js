function OrderTracker({ status }) {
  const steps = ["Placed", "Preparing", "On the way", "Delivered"];

  return (
    <div className="order-tracker">
      {steps.map((step) => (
        <span
          key={step}
          className={`order-tracker__step${
            step === status || (status === "Out for delivery" && step === "On the way")
              ? " active"
              : ""
          }`}
        >
          {step}
        </span>
      ))}
    </div>
  );
}

export default OrderTracker;
