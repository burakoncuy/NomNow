import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
	getUserOrders,
	loadUserOrder,
	createOrder,
	clearCurrentOrder,
} from '../../redux/orders';
import OrderItems from './OrderItems';
import './Orders.css';

export default function Orders() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const error = useSelector((state) => state.errors.message || '');
	// const currentOrder = useSelector((store) => store.orders.currentOrder || {});
	const orders = useSelector((state) => state.orders.userOrders || []);
	const isLoading = !orders || orders.length === 0;

	useEffect(() => {
		dispatch(getUserOrders());
	}, [dispatch]);

	if (isLoading) return <div>Loading orders...</div>;
	if (error) return <div className='error-message'>{error}</div>;
	if (!orders.length) return <div>No past orders found.</div>;

	const handleRestaurantClick = (restaurantId) => {
		if (restaurantId) {
			navigate(`/restaurants/${restaurantId}`);
		}
	};

	const handleMenuItemClick = (menuItemId) => {
		if (menuItemId) {
			navigate(`/menu-items/${menuItemId}`);
		}
	};

	// Handle "Rate your order" button
	const handleRateOrder = (orderId, restaurantId, restaurantName) => {
		navigate(
			`/reviews/restaurant/${restaurantId}?orderId=${orderId}&restaurantName=${encodeURIComponent(
				restaurantName
			)}`
		);
	};

	const handleReorder = async (order) => {
		if (!order || !order.orderItems || order.orderItems.length === 0) {
			return;
		}

		dispatch(clearCurrentOrder());
		// Extract restaurant ID
		const restaurantId = order.restaurant?.id;
		if (!restaurantId) {
			return;
		}

		// Format the items to match the API request
		const items = order.orderItems.map((item) => ({
			menu_item_id: item.menu_item_id, // Ensure correct menu item ID
			quantity: item.quantity,
			restaurant_id: item.restaurant_id,
		}));

		const reorderData = {
			restaurant_id: restaurantId,
			items,
		};

		// Send the request to create a new order
		const response = await dispatch(createOrder(reorderData));

		if (response?.payload) {
			const newOrder = response.payload;

			// Update Redux state and localStorage
			dispatch(loadUserOrder(newOrder));
			localStorage.setItem('currentOrder', JSON.stringify(newOrder));

			// Navigate to checkout
			navigate('/checkout');
		}
	};

	return (
		<div className='orders-container'>
			<h2>Past Orders</h2>
			{orders
				.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
				.map((order) => (
					<div
						key={order.id}
						className='order-card'
						// onClick={() => handleRestaurantClick(order.restaurant?.id)}
					>
						<img
							src={order.restaurant?.image || '/images/cart.jpeg'}
							alt={order.restaurant?.name || 'Unknown Restaurant'}
							className='restaurant-img'
							onClick={(e) => {
								e.stopPropagation(); // Prevent parent click event
								handleRestaurantClick(order.restaurant?.id);
							}}
							style={{
								cursor: 'pointer',
							}}
						/>
						<div className='order-header'>
							<div className='order-restaurant'>
								<h3
									onClick={(e) => {
										e.stopPropagation(); // Prevent parent click event
										handleRestaurantClick(order.restaurant?.id);
									}}
									style={{
										cursor: 'pointer',
									}}>
									{order.restaurant?.name || 'Unknown Restaurant'}
								</h3>
							</div>
							<div className='order-details'>
								<p>
									{Array.isArray(order.orderItems)
										? order.orderItems.length
										: 0}{' '}
									item
									{order.orderItems?.length > 1 ? 's' : ''} for $
									{Number(order.totalCost).toFixed(2) || '0.00'}{' '}
								</p>
								•
								<p>
									{order.createdAt
										? new Date(order.createdAt).toLocaleString()
										: 'No Date Available'}
								</p>
								•{/* Order Actions */}
								<div className='order-actions'>
									<a href={`/orders/${order.id}/receipt`}>
										View receipt
									</a>
									•
									<a href={`/orders/${order.id}/invoice`}>
										Request Invoice
									</a>
								</div>
							</div>
							{/* Order Items */}
							<div className='order-items'>
								{Array.isArray(order.orderItems) ? (
									order.orderItems.map((item) => (
										<OrderItems
											key={item.id}
											item={item}
										/>
									))
								) : (
									<p>No items found</p>
								)}
							</div>
						</div>

						{/* Buttons */}
						<div className='order-buttons'>
							<button
								className='reorder-btn'
								onClick={(e) => {
									e.stopPropagation();
									handleReorder(order);
								}}>
								Reorder
							</button>
							<button
								className='rate-btn'
								disabled={order.status !== 'Completed'}
								onClick={(e) => {
									e.stopPropagation();
									handleRateOrder(
										order.id,
										order.restaurant?.id,
										order.restaurant?.name
									);
								}}>
								Rate your order
							</button>
						</div>
					</div>
				))}
		</div>
	);
}


// const handleReorder = async (order) => {
// 	console.log('Reordering order:', order);

// 	if (!order || !order.orderItems) {
// 		console.error('Invalid order data');
// 		return;
// 	}

// 	const uniqueRestaurantIds = new Set(
// 		order.orderItems.map((item) => item.restaurant_id)
// 	);
// 	if (uniqueRestaurantIds.size > 1) {
// 		console.error('All items must be from the same restaurant.');
// 		return;
// 	}

// 	try {
// 		const response = await fetch('/api/orders/reorder', {
// 			method: 'POST',
// 			headers: { 'Content-Type': 'application/json' },
// 			body: JSON.stringify({ orderId: order.id }),
// 		});

// 		if (!response.ok) {
// 			throw new Error('Failed to reorder');
// 		}

// 		const newOrder = await response.json();
// 		dispatch(setCurrentOrder(newOrder));
// 		navigate('/checkout');
// 	} catch (error) {
// 		console.error('Error creating reorder:', error);
// 	}
// };