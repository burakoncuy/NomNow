import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRestaurant } from '../../redux/restaurants';
import { getMenuItems } from '../../redux/menuItems';
import { addToCart } from '../../redux/cart';
import { getReviewsForRestThunk } from '../../redux/reviews';
import ReviewList from '../Reviews/ReviewList';
import ReviewForm from '../Reviews/ReviewForm';

import './RestaurantDetail.css';

function RestaurantDetail() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { id } = useParams();
	const { currentRestaurant, error } = useSelector(
		(state) => state.restaurants
	);
    const reviews = useSelector((state) => state.reviews.allReviewsForRest);
	const [deliveryMethod, setDeliveryMethod] = useState('delivery');
	const { menuItems } = useSelector((state) => state.menuItems);
	const user = useSelector((state) => state.session.user);
	const cart = useSelector((state) => state.cart);
	const cartItems = cart?.cartItems || [];
    const calculateAverageRating = (reviews) => {
        if (!reviews || reviews.length === 0) return null;
        const totalRating = reviews.reduce((sum, review) => sum + review.restaurantRating, 0);
        return (totalRating / reviews.length).toFixed(1);
    };
    
	// State to track confirmation messages for each menu item
	const [confirmationMessages, setConfirmationMessages] = useState({});

	useEffect(() => {
		if (id) {
			dispatch(getRestaurant(id));
			dispatch(getMenuItems());
            dispatch(getReviewsForRestThunk(id)); 
		}
	}, [dispatch, id]);

	if (error) return <div>Error: {error}</div>;
	if (!currentRestaurant?.restaurant) return <div>Loading...</div>;

	const restaurant = currentRestaurant.restaurant;
	const restaurantMenuItems = menuItems.filter(
		(item) => item.restaurantId === parseInt(id)
	);

	const handleAddToCart = (item) => {
		if (!user) {
			alert('You must be logged in to add items to the cart!');
			return;
		}

		// Check if cart has items from a different restaurant
		if (cartItems.length > 0 && cartItems[0].restaurantId !== parseInt(id)) {
			alert(
				'Your cart contains items from a different restaurant. Please clear your cart or complete your existing order first.'
			);
			return;
		}

		const orderData = {
			id: item.id,
			name: item.name,
			price: item.price,
			restaurantId: parseInt(id), // Make sure restaurantId is an integer
			food_image: item.food_image,
			restaurant: item.restaurant,
			quantity: 1,
		};

		dispatch(addToCart(orderData));
		
		// Set the confirmation message for the specific item that was added to the cart
		setConfirmationMessages((prevMessages) => ({
			...prevMessages,
			[item.id]: `Added ${item.name} to cart!`,
		}));
		
		// Clear the confirmation message after 3 seconds
		setTimeout(() => {
			setConfirmationMessages((prevMessages) => {
				const newMessages = { ...prevMessages };
				delete newMessages[item.id]; // Remove the message for this specific item
				return newMessages;
			});
		}, 3000);
	};

    return (
        <div className="restaurant-detail">
            {/* Header Image */}
            <div className="restaurant-hero">
                <img src={restaurant.storeImage} alt={restaurant.name} />
            </div>
            <button className="back-button" onClick={() => navigate(`/`)}>
                <span className="back-arrow">←</span> Back to Restaurants
            </button>

            {/* Restaurant Name and Search Section */}
            <div className="restaurant-info-section">
                <div className="restaurant-main-info">
                    <h1>{restaurant.name}</h1>
                    <div className="restaurant-details">
                        <span>{restaurant.deliveryTime} min</span>
                        <span>{restaurant.priceLevel}</span>
                        <span className="tag">{restaurant.cuisineType}</span>
                    </div>
                    <div className="location-hours">
                        <p>{restaurant.address}, {restaurant.city}, {restaurant.state} {restaurant.zip}</p>
                        <p className="business-hours-top">{restaurant.businessHours}</p>
                    </div>
                </div>

                <div className="search-section">
                    <input
                        type="search"
                        className="search-input"
                        placeholder={`Search in ${restaurant.name || 'restaurant'}`}
                        onClick={()=> alert('Feature coming soon')}
                    />
				</div>
			</div>

			{/* Delivery Options */}
			<div className='delivery-header'>
				<div className='delivery-toggle' data-active={deliveryMethod}>
					<button
						className={deliveryMethod === 'delivery' ? 'active' : ''}
                        onClick={() => {
                            setDeliveryMethod('delivery');
                            alert('Feature coming soon')
                        }}>
						Delivery
					</button>
					<button
						className={deliveryMethod === 'pickup' ? 'active' : ''}
                        onClick={() => {
                            setDeliveryMethod('pickup');
                            alert('Feature coming soon');
                        }}>
						Pickup
					</button>
					<div className='slider'></div>
				</div>

				<button className='group-order-btn' onClick={()=> alert('Feature coming soon')}>
					<span className='icon'>👥</span>
					Group order
				</button>

				<div className='delivery-info'>
					<div className='info-item'>
						<span className='delivery-fee'>
							$
							{restaurant.deliveryFee
								? `${restaurant.deliveryFee} Delivery Fee on $15+`
								: '$0 Delivery Fee on $15+'}
						</span>
					</div>

					<div className='info-item'>
						<span className='arrival-time'>
							{restaurant.deliveryTime} min
						</span>
						<span className='info-label' style={{textDecoration: 'none'}}>Earliest arrival</span>
					</div>
				</div>
			</div>

			{/* Menu Section */}
			<div className='menu-section'>
				<h2>Menu</h2>
				{restaurantMenuItems.length > 0 ? (
					<div className='menu-grid'>
						{restaurantMenuItems.map((item) => (
							<div key={item.id} className='menu-item'>
								<Link to={`/menu-items/${item.id}`}>
									<img src={item.food_image} alt={item.name} />
								</Link>
								<div className='menu-item-info'>
									<Link to={`/menu-items/${item.id}`}>
										<h3>{item.name}</h3>
									</Link>
									<p className='price'>${item.price}</p>
									<p className='tag'>{item.food_type}</p>
									<button
										className={`add-to-cart-btn ${
											!user.address ||
											(cartItems.length > 0 &&
												cartItems[0].restaurantId !== parseInt(id))
												? 'disabled'
												: ''
										}`}
										disabled={
											!user.address ||
											(cartItems.length > 0 &&
												cartItems[0].restaurantId !== parseInt(id))
										}
										onClick={() => handleAddToCart(item)}>
										{!user.address
											? 'Enter address to add'
											: cartItems.length > 0 &&
											cartItems[0].restaurantId !== parseInt(id)
											? 'Items from another restaurant in cart'
											: 'Add to Cart'}
									</button>
									{/* Show confirmation message only for the clicked item */}
									{confirmationMessages[item.id] && (
										<p className="confirmation-message">{confirmationMessages[item.id]}</p>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<p>No menu items available</p>
				)}
			</div>

            {/* Reviews Section */}
            <div className='reviews-section'>
                <div className='reviews-header'>
                    <div className='reviews-title-rating'>
                        <h2>Reviews</h2>
                        {reviews && reviews.length > 0 && (
                            <span className='rating-summary'>
                                ⭐ {calculateAverageRating(reviews)}
                                <span className='review-count'>
                                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                                </span>
                            </span>
                        )}
                    </div>
                    {user && <ReviewForm restaurantId={id} />}
                </div>
                <ReviewList />
            </div>
		</div>
	);
}

export default RestaurantDetail;
