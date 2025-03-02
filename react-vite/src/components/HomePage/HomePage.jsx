import { useSelector, useDispatch} from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRestaurants } from '../../redux/restaurants';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './HomePage.css'
const CUISINE_TYPES = [
    { name: "American", icon: "🍔" },
    { name: "Chinese", icon: "🥡" },
    { name: "Italian", icon: "🍝" },
    { name: "Japanese", icon: "🍱" },
    { name: "Mexican", icon: "🌮" },
    { name: "Indian", icon: "🍛" },
    { name: "Thai", icon: "🥘" },
    { name: "Mediterranean", icon: "🫓" },
    { name: "Korean", icon: "🍜" },
    { name: "Vietnamese", icon: "🍜" },
    { name: "Greek", icon: "🥙" },
    { name: "Spanish", icon: "🥘" },
    { name: "Seafood", icon: "🦐" },
    { name: "Pizza", icon: "🍕" },
    { name: "Vegetarian", icon: "🥗" },
    { name: "Vegan", icon: "🥬" },
    { name: "Breakfast", icon: "🍳" },
    { name: "Fast Food", icon: "🍟" },
    { name: "Caribbean", icon: "🌴" },
    { name: "Soul Food", icon: "🍗" }
];

function HomePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // const user = useSelector((store) => store.session.user);
    const restaurants = useSelector(state => state.restaurants.restaurants);
    const [selectedCuisine, setSelectedCuisine] = useState(null);
    const scrollContainerRef = useRef(null);   
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    useEffect(() => {
        dispatch(getAllRestaurants());
    }, [dispatch]);


    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (container) {
            setShowLeftArrow(container.scrollLeft > 0);
            setShowRightArrow(
                container.scrollLeft < container.scrollWidth - container.clientWidth
            );
        }
    };

    const scroll = (direction) => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 200; // Adjust this value to control scroll distance
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };


    const handleRestaurantClick = (restaurantId) => {
        navigate(`/restaurants/${restaurantId}`);
    };

    // Filter active restaurants first - using servicing property
    const activeRestaurants = restaurants.filter(restaurant => restaurant.servicing === true);

    const availableCuisines = new Set(
        activeRestaurants.map(restaurant => restaurant.cuisineType.toLowerCase())
    );

    const handleCuisineClick = (cuisineName) => {
        if (availableCuisines.has(cuisineName.toLowerCase())) {
            setSelectedCuisine(cuisineName === selectedCuisine ? null : cuisineName);
        }
    };

    // Apply cuisine filter only to active restaurants
    const filteredRestaurants = selectedCuisine
        ? activeRestaurants.filter(restaurant =>
            restaurant.cuisineType.toLowerCase() === selectedCuisine.toLowerCase())
        : activeRestaurants;

        return (
            <div className='home-page'>
                <div className='main-content'>
                    <div className='cuisine-scroll-container'>
                        {showLeftArrow && (
                            <button 
                                className='scroll-arrow scroll-arrow-left'
                                onClick={() => scroll('left')}
                                aria-label="Scroll left"
                            >
                                <FaChevronLeft size={24} />
                            </button>
                        )}
                        
                        <div 
                            className='cuisine-scroll-bar'
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                        >
                            {CUISINE_TYPES.map((cuisine) => {
                                const isAvailable = availableCuisines.has(cuisine.name.toLowerCase());
                                return (
                                    <button
                                        key={cuisine.name}
                                        onClick={() => handleCuisineClick(cuisine.name)}
                                        className={`cuisine-button ${selectedCuisine === cuisine.name ? 'active' : ''}
                                                  ${!isAvailable ? 'disabled' : ''}`}
                                        disabled={!isAvailable}
                                    >
                                        <span className="cuisine-icon">{cuisine.icon}</span>
                                        <span className="cuisine-name">{cuisine.name}</span>
                                    </button>
                                );
                            })}
                        </div>
    
                        {showRightArrow && (
                            <button 
                                className='scroll-arrow scroll-arrow-right'
                                onClick={() => scroll('right')}
                                aria-label="Scroll right"
                            >
                                <FaChevronRight size={24} />
                            </button>
                        )}
                    </div>

                {/* Restaurants Grid */}
                <div className='restaurants-section'>
                    <h2>
                        {selectedCuisine ? `${selectedCuisine} Restaurants` : 'All Restaurants'}
                        <span className="results-count">
                            {/* ({filteredRestaurants.length} results) */}
                        </span>
                    </h2>
                    <div className='restaurants-grid'>
                        {filteredRestaurants.map((restaurant) => (
                            <div
                                key={restaurant.id}
                                className='restaurant-card'
                                onClick={() => handleRestaurantClick(restaurant.id)}
                            >
                                <div className='restaurant-image'>
                                    <img
                                        src={restaurant.storeImage || '/placeholder.jpg'}
                                        alt={restaurant.name}
                                    />
                                </div>
                                <div className='restaurant-info'>
                                    <h3>{restaurant.name}</h3>
                                    <div className='restaurant-details'>
                                    <span className='rating'>
                                        ⭐ {restaurant.rating || 'New'}
                                        <span className='review-count'>
                                            {restaurant.numReviews > 0 && `(${restaurant.numReviews} reviews)`}
                                        </span>
                                    </span>
                                        {restaurant.deliveryTime && (
                                            <span className='delivery-time'>
                                                {restaurant.deliveryTime} min
                                            </span>
                                        )}
                                        <span className='delivery-fee'>
                                            ${restaurant.deliveryFee?.toFixed(2) || '0.00'} delivery
                                        </span>
                                    </div>
                                    <div className='restaurant-tags'>
                                        <span className='cuisine-type'>{restaurant.cuisineType.toLowerCase()}</span>
                                        <span className='price-level'>{restaurant.priceLevel}</span>
                                    </div>
                                    {restaurant.description && (
                                        <p className='description'>{restaurant.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;