import React from "react";

interface RecordIconProps {
	recordType: string;
	isHalf?: boolean;
}

const RecordIcon: React.FC<RecordIconProps> = ({ recordType, isHalf }) => {
	return recordType === "soju" && !isHalf ? (
		<img
			src={`${process.env.REACT_APP_BASE_URL}/images/soju.png`}
			alt="soju"
			style={{ pointerEvents: "none" }}
		/>
	) : recordType === "soju" && isHalf ? (
		<img
			src={`${process.env.REACT_APP_BASE_URL}/images/soju_half.png`}
			alt="soju_half"
		/>
	) : recordType === "beer" ? (
		<span>🍺</span>
	) : null;
};

export default RecordIcon;
