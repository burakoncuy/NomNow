import { useModal } from './Modal.jsx';
import { useState, useRef, useEffect } from 'react';
import './ScheduleModal.css';

export default function ScheduleModal({
	setScheduledTime,
	restaurantClosingTime,
}) {
	const { closeModal } = useModal();
	const [selectedDate, setSelectedDate] = useState(null);
	const [selectedTime, setSelectedTime] = useState(null);
	const [dates, setDates] = useState([]);
	const [timeSlots, setTimeSlots] = useState([]);
	const dateScrollRef = useRef(null);

	// Generate the next 7 days dynamically
	const generateDates = () => {
		const newDates = [];
		const today = new Date();

		for (let i = 0; i < 7; i++) {
			const date = new Date(today);
			date.setDate(today.getDate() + i);

			newDates.push({
				day:
					i === 0
						? 'Today'
						: i === 1
						? 'Tomorrow'
						: date.toLocaleDateString('en-US', { weekday: 'short' }),
				date: date.toLocaleDateString('en-US', {
					month: 'short',
					day: '2-digit',
				}),
				fullDate: date.toISOString().split('T')[0], // Format YYYY-MM-DD
			});
		}
		setDates(newDates);
	};

	// Generate time slots dynamically based on restaurant's closing time
	const generateTimeSlots = (selectedFullDate) => {
		const newTimeSlots = [];
		const now = new Date();
		const selectedDate = new Date(selectedFullDate);
		let startHour = 17; // Default start time (5 PM)
		let endHour = restaurantClosingTime
			? parseInt(restaurantClosingTime.split(':')[0])
			: 22; // Use restaurant closing time

		// Adjust start hour if today is selected
		if (selectedDate.toDateString() === now.toDateString()) {
			startHour = Math.max(now.getHours() + 1, startHour); // Ensure at least 1 hour from now
		}

		// Prevent startHour from exceeding endHour
		if (startHour >= endHour) {
			setTimeSlots([]);
			return;
		}

		for (let hour = startHour; hour < endHour; hour++) {
			for (let minute of [0, 30]) {
				// 30-minute increments
				const timeSlot = new Date(selectedDate);
				timeSlot.setHours(hour, minute, 0);

				if (
					timeSlot > now ||
					selectedDate.toDateString() !== now.toDateString()
				) {
					newTimeSlots.push(
						timeSlot.toLocaleTimeString('en-US', {
							hour: 'numeric',
							minute: '2-digit',
						}) +
							' - ' +
							new Date(
								timeSlot.getTime() + 30 * 60000
							).toLocaleTimeString('en-US', {
								hour: 'numeric',
								minute: '2-digit',
							})
					);
				}
			}
		}

		setTimeSlots(newTimeSlots);
	};

	useEffect(() => {
		generateDates();
	}, []);

	useEffect(() => {
		if (selectedDate) {
			const selectedFullDate = dates.find(
				(d) => d.date === selectedDate
			)?.fullDate;
			if (selectedFullDate) generateTimeSlots(selectedFullDate);
		}
	}, [selectedDate, dates, restaurantClosingTime]);

	useEffect(() => {
		if (dates.length > 0) {
			setSelectedDate(dates[0].date);
		}
	}, [dates]);

	const handleSchedule = () => {
		if (selectedDate && selectedTime) {
			setScheduledTime(`${selectedDate} at ${selectedTime}`);
			closeModal();
		}
	};

	return (
		<div className='schedule-modal'>
			<h2>Schedule delivery</h2>

			{/* Scrollable Date Selection */}
			<div className='date-selection-container'>
				<button
					className='scroll-arrow left'
					onClick={() =>
						dateScrollRef.current.scrollBy({
							left: -100,
							behavior: 'smooth',
						})
					}>
					←
				</button>
				<div className='date-selection' ref={dateScrollRef}>
					{dates.map(({ day, date }) => (
						<button
							key={date}
							className={selectedDate === date ? 'selected' : ''}
							onClick={() => setSelectedDate(date)}>
							<span>{day}</span>
							<span>{date}</span>
						</button>
					))}
				</div>
				<button
					className='scroll-arrow right'
					onClick={() =>
						dateScrollRef.current.scrollBy({
							left: 100,
							behavior: 'smooth',
						})
					}>
					→
				</button>
			</div>

			{/* Time Selection */}
			<div className='time-selection'>
				{timeSlots.length > 0 ? (
					timeSlots.map((time) => (
						<label key={time} className='radio-option'>
							<input
								type='radio'
								name='timeSlot'
								value={time}
								checked={selectedTime === time}
								onChange={() => setSelectedTime(time)}
							/>
							<span className='radio-circle'></span>
							{time}
						</label>
					))
				) : (
					<p className='no-available-times'>No available times</p>
				)}
			</div>

			{/* Action Buttons */}
			<div className='modal-actions'>
				<button
					onClick={handleSchedule}
					disabled={!selectedDate || !selectedTime}>
					Schedule
				</button>
				<button onClick={closeModal} className='cancel-btn'>
					Cancel
				</button>
			</div>
		</div>
	);
}
