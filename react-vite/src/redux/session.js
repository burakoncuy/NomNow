import { csrfFetch } from "./csrf";
import { clearCart } from './cart';

const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';
const EDIT_USER = 'session/editUser';

const setUser = (user) => ({
  type: SET_USER,
  payload: user
});

const removeUser = () => ({
  type: REMOVE_USER
});

const editUser = (payload) => ({
  type: EDIT_USER,
  payload
})


export const thunkAuthenticate = () => async (dispatch) => {
  const response = await fetch("/api/auth/");
  if (response.ok) {
    const data = await response.json();
    if (data.errors) {
      return;
    }

    dispatch(setUser(data));
  }
};

export const thunkLogin = (credentials) => async (dispatch) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (response.ok) {
    const data = await response.json();
    const prevUserId = localStorage.getItem('currentUser');
    const newUserId = data.id;

    if (prevUserId !== newUserId) {
      dispatch(clearCart(prevUserId));
    }

    localStorage.setItem('currentUser', newUserId);
    dispatch(setUser(data));
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return errorMessages;
  } else {
    return { server: 'Something went wrong. Please try again' };
  }
};

export const thunkSignup = (user) => async (dispatch) => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });

  if (response.ok) {
    const data = await response.json();
    const prevUserId = localStorage.getItem('currentUser');
    const newUserId = data.id;

    if (prevUserId !== newUserId) {
      dispatch(clearCart(prevUserId));
    }

    localStorage.setItem('currentUser', newUserId);
    dispatch(setUser(data));
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return errorMessages;
  } else {
    return { server: 'Something went wrong. Please try again' };
  }
};

export const thunkLogout = () => async (dispatch) => {
  await fetch("/api/auth/logout");
  dispatch(removeUser());
};


export const addFundsThunk = (fundsObject) => async (dispatch) => {
  const {id, amount} = fundsObject
    const response = await csrfFetch(`/api/users/wallet/${id}`, {
        method: "PUT",
        body: JSON.stringify({amount}),
    });
    if(response.ok){
        const data = await response.json()
        console.log('DATA', data)
        dispatch(editUser(data))
    }
    else if(response.status < 500){
        const errorMessages = await response.json()
        return errorMessages
    } else {
      return {server: 'Something went wrong. Please try again'}
    }
}

export const deductFundsThunk = (fundsObject) => async (dispatch) => {
	const { id, amount } = fundsObject;

	const response = await csrfFetch(`/api/users/wallet/deduct/${id}`, {
		method: 'PUT',
		body: JSON.stringify({ amount }),
	});

	if (response.ok) {
		const data = await response.json();
		dispatch(editUser(data)); // Update user state in Redux
	} else if (response.status < 500) {
		const errorMessages = await response.json();
		return errorMessages;
	} else {
		return { server: 'Something went wrong. Please try again' };
	}
};

export const editUserThunk = (updateObj) => async (dispatch) => {
    const {id} = updateObj
    const response = await csrfFetch(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateObj),
    });
    if(response.ok){
        const data = await response.json()
        console.log('DATA', data)
        dispatch(editUser(data))
    }
    else if(response.status < 500){
        const errorMessages = await response.json()
        return errorMessages
    } else {
      return {server: 'Something went wrong. Please try again'}
    }
}
export const uploadPfp = (file) => async (dispatch) => {
  const {id} = file
  // let id
  // let profile_image
  // for(let key of file.keys()){
  //   console.log('KEY', key)
  //   if(key === 'id') id = file.get(key)
    // if(key === 'profile_image') profile_image = file.get(key)
  // }
  const response = await csrfFetch(`/api/users/pfp/${id}`, {
      method: "PUT",
      body: JSON.stringify(file),
  });
  if(response.ok){
      const data = await response.json()
      console.log('DATA', data)
      dispatch(editUser(data))
  }
  else if(response.status < 500){
      const errorMessages = await response.json()
      return errorMessages
  } else {
    return {server: 'Something went wrong. Please try again'}
  }
}

export const guestLogin = (address) => async (dispatch)=>{
  const guest = {
    firstName: "Guest",
    guestAccount: true,
    address: address.address,
    city: address.city,
    state: address.state,
    zip: address.zip,
    wallet: 0
  }

  await dispatch(setUser(guest))
}

const initialState = { user: null };

function sessionReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    case EDIT_USER:
      return { ...state, user: action.payload }
    default:
      return state;
  }
}

export default sessionReducer;


