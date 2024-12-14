import React, { useState, useEffect, useCallback } from "react";
import { RecordType, Record, RecordTypeInfo, Attendee } from "../types";
import api from "../api";
import CreatableSelect from "react-select/creatable";

interface OptionType {
	value: string;
	label: string;
}

interface ManageRecordModalProps {
	selectedDate: string | null;
	records: Record[];
	onClose: () => void;
}

const ManageRecordModal: React.FC<ManageRecordModalProps> = ({
	selectedDate,
	records = [],
	onClose,
}: ManageRecordModalProps) => {
	const [attendees, setAttendees] = useState<Attendee[]>([]);
	const [friends, setFriends] = useState<OptionType[]>([]);

	const fetchAttendees = useCallback(async () => {
		try {
			const response = await api.get(`/attendees/${selectedDate}`);
			setAttendees(response.data);
		} catch (error: any) {
			sessionStorage.setItem("error", error);
			window.location.href = "/error";
		}
	}, [selectedDate]);

	useEffect(() => {
		if (!selectedDate) return;
		fetchAttendees();
	}, [fetchAttendees, selectedDate]);

	useEffect(() => {
		const fetchFriends = async () => {
			try {
				const response = await api.get("/attendees");
				setFriends(
					response.data.map((attendee: Attendee) => ({
						value: attendee.name,
						label: attendee.name,
					}))
				);
			} catch (error: any) {
				sessionStorage.setItem("error", error);
				window.location.href = "/error";
			}
		};
		fetchFriends();
	}, []);

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

	const handleAddAttendee = async (attendeeName: string) => {
		if (!attendeeName) {
			alert("참여자 이름을 입력해주세요.");
			return;
		}
		if (records.length === 0) {
			alert("기록을 먼저 추가해주세요.");
			return;
		}

		try {
			const response = await api.post(
				`/attendees/${selectedDate}/${attendeeName}`
			);

			console.info(response.data);
		} catch (error: any) {
			// 403: 참여자 최대 인원 초과, 409: 이미 추가된 참여자
			if (
				error.response.status === 403 ||
				error.response.status === 409
			) {
				alert(error.response.data);
				return;
			}
			sessionStorage.setItem("error", error);
			window.location.href = "/error";
		}

		fetchAttendees();
	};

	const handleUpdateRecord = async (recordType: RecordType) => {
		const amount = prompt("수정할 양을 입력해주세요");
		if (!amount) return;
		if (![0.5, 1, 1.5, 2, 2.5, 3, 4, 5].includes(Number(amount))) {
			alert("잘못된 양입니다.");
			return;
		}

		try {
			const response = await api.patch(`/records/${selectedDate}/${recordType}`, {
				amount: Number(amount),
			});
			console.info(response.data);
		} catch (error: any) {
			sessionStorage.setItem("error", error);
			window.location.href = "/error";
		}
		onClose();
	}

	const handleRemoveAttendee = async (attendeeName: string) => {
		if (!window.confirm(`${attendeeName} 참여자를 삭제하시겠습니까?`))
			return;

		try {
			const response = await api.delete(
				`/attendees/${selectedDate}/${attendeeName}`
			);
			console.info(response.data);
		} catch (error: any) {
			sessionStorage.setItem("error", error);
			window.location.href = "/error";
		}

		fetchAttendees();
	};

	return (
		<div
			className={`modal ${selectedDate ? "is-active" : ""}`}
			style={{ padding: "15px" }}
		>
			<div className="modal-background" onClick={onClose}></div>
			<section className="modal-card" style={{ height: "80%" }}>
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
											<div className="is-flex" style={{ gap: "1rem" }}>
												<button
													className="button is-info"
													onClick={() =>
														handleUpdateRecord(
															recordType as RecordType
														)
													}
												>
													수정
												</button>
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
											</div>
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
					{/* 구분선 */}
					<hr />
					{/* 참여자 추가 UI */}
					<label className="label">참여자</label>
					<div
						className="field is-flex is-align-items-center is-justify-content-space-between"
						style={{ gap: "1rem" }}
					>
						<div style={{ flex: 1 }}>
							<CreatableSelect
								options={friends}
								onCreateOption={(attendeeName) => {
									handleAddAttendee(attendeeName);
								}}
								onChange={(selectedOption) => {
									handleAddAttendee(
										(selectedOption as OptionType).value
									);
								}}
								placeholder="참여자 이름"
								isSearchable={true}
								formatCreateLabel={(inputValue: string) =>
									`${inputValue} 추가`
								}
							/>
						</div>
					</div>
					{/* 참여자 목록 */}
					<div className="tags">
						{Object.entries(attendees).map(
							([_, attendee]: [string, Attendee]) => (
								<span
									key={attendee.id}
									className="tag is-dark is-size-6"
									onClick={() =>
										handleRemoveAttendee(attendee.name)
									}
								>
									{attendee.name}
								</span>
							)
						)}
					</div>
				</section>
			</section>
		</div >
	);
};

export default ManageRecordModal;
