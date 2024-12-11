import React from "react";
import { Record, RecordType, View } from "../types";

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

const getRecordSingleElement = (recordType: RecordType, amount: number) => {
	const elements = [];

	if (amount === 0 || amount % 0.5 !== 0)
		throw new Error(`${amount} is not a valid amount`);

	// 한병(정수) 처리
	for (let i = 0; i < Math.floor(amount); i++) {
		elements.push(<RecordIcon key={i} recordType={recordType} />);
	}
	// 반병 처리
	if (amount % 1 !== 0) {
		elements.push(<RecordIcon key={0.5} recordType={recordType} isHalf />);
	}

	return elements;
};

const getRecordElements = (
	date: string,
	records: Record[],
	view: View = View.MONTH
) => {
	if (view === View.YEAR) {
		return (
			<div key={date}>
				{records.map((record, index: number) => (
					<div key={index}>
						{getRecordSingleElement(record.recordType, 1)}X{" "}
						{record.amount}
					</div>
				))}
			</div>
		);
	} else {
		return (
			<div key={date}>
				{records.map((record, index: number) => (
					<div key={index}>
						{getRecordSingleElement(
							record.recordType,
							record.amount
						)}
					</div>
				))}
			</div>
		);
	}
};
export { getRecordElements };
