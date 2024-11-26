import React from "react";
import { RecordType, Record, RecordTypeInfo } from "../types";
import api from "../api";

interface ManageRecordModalProps {
	selectedDate: string | null;
	records: Record[];
	onClose: () => void;
}

const ManageRecordModal = ({
	selectedDate,
	records = [],
	onClose,
}: ManageRecordModalProps) => {
	const handleAddRecord = async (recordType: RecordType) => {
		const amount = prompt("양을 입력해주세요");
		if (!amount) return;
		if (![0.5, 1, 1.5, 2, 2.5, 3, 4, 5].includes(Number(amount))) {
			alert("잘못된 양입니다.");
			return;
		}

		try {
			const response = await api.post("/records", {
				date: selectedDate,
				recordType,
				amount: Number(amount),
			});
			console.info(await response.data);
		} catch (error: any) {
			sessionStorage.setItem("error", error);
			window.location.href = "/error";
		}
		onClose();
	};

	const handleRemoveRecord = async (recordType: RecordType) => {
		if (
			!window.confirm(
				`${RecordTypeInfo[recordType].korName} 기록을 삭제하시겠습니까?`
			)
		)
			return;

		try {
			const response = await api.delete(
				`/records/${selectedDate}/${recordType}`
			);
			console.info(await response.data);
		} catch (error: any) {
			sessionStorage.setItem("error", error);
			window.location.href = "/error";
		}
		onClose();
	};

	return (
		<div
			className={`modal ${selectedDate ? "is-active" : ""}`}
			style={{ padding: "15px" }}
		>
			<div className="modal-background" onClick={onClose}></div>
			<section className="modal-card">
				<header className="modal-card-head">
					<p className="modal-card-title has-text-centered">
						{selectedDate}
					</p>
					<button
						className="delete"
						aria-label="close"
						onClick={onClose}
					></button>
				</header>
				<section className="modal-card-body">
					{Object.entries(RecordTypeInfo).map(
						([recordType, { korName, unit }]) => {
							const amount =
								records.find(
									(record) => record.recordType === recordType
								)?.amount || 0;

							return (
								<div
									key={recordType}
									className="field is-flex is-align-items-center is-justify-content-space-between"
								>
									<label className="label">
										{korName}{" "}
										{amount ? `${amount}${unit}` : ``}
									</label>
									<div className="control">
										{amount ? (
											<button
												className="button is-danger"
												onClick={() =>
													handleRemoveRecord(
														recordType as RecordType
													)
												}
											>
												삭제
											</button>
										) : (
											<button
												className="button is-primary"
												onClick={() =>
													handleAddRecord(
														recordType as RecordType
													)
												}
											>
												추가
											</button>
										)}
									</div>
								</div>
							);
						}
					)}
				</section>
			</section>
		</div>
	);
};

export default ManageRecordModal;
