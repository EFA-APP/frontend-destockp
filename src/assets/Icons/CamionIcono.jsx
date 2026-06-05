import { Truck } from "lucide-react";

const CamionIcono = ({ size = 20, color = "currentColor", strokeWidth = 2, className = "" }) => {
  return (
    <Truck
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
};

export default CamionIcono;
