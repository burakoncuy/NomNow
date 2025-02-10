import { useState } from "react";
import { thunkLogin, thunkSignup } from "../../redux/session";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import "./LoginForm.css";

function LoginFormPage({isLogin, isSignup}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [name, setName] = useState("")
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  console.log({
    credential,
    password,
    errors,
  })

  if (sessionUser) return <Navigate to="/" replace={true} />

  const demoSubmit = async(e, name) =>{
    e.preventDefault()
    if(name === 'burak'){
      await dispatch(thunkLogin({email: 'b@user.io', password: 'password'}))
    }
    else if(name === 'gabe'){
      await dispatch(thunkLogin({email: 'g@user.io', password: 'password'}))
    }
    else if(name === 'katie'){
      await dispatch(thunkLogin({email: 'k@user.io', password: 'password'}))
    }
    else if(name === 'mar'){
      await dispatch(thunkLogin({email: 'm@user.io', password: 'password'}))
    }
    else if(name === 'sama'){
      await dispatch(thunkLogin({email: 's@user.io', password: 'password'}))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userSubmission = {
      password
    }
    setErrors({})
    
    if(credential === "") return setErrors({credential: "Please enter a valid email or phone number"})
    else if(credential.includes("@")){
      if(credential.split('@')[1].includes('.')) userSubmission.email = credential
    }
    else if(credential.includes('-') || credential.length === 10){
      let phoneNumber = credential
      if(phoneNumber.includes('-')) phoneNumber = phoneNumber.split('-').join('')
      if(phoneNumber.length !== 10) return setErrors({credential: "Please enter a valid email or phone number"})
      userSubmission.phone_number = phoneNumber
    }

    if(name.includes(' ')){
      const nameSplit = name.split(' ')
      userSubmission.first_name = nameSplit[0]
      userSubmission.last_name = nameSplit[nameSplit.length-1]
    } else {
      userSubmission.first_name = name
    }

    if(!userSubmission.email || !userSubmission.phone_number) return setErrors({credential: "Please enter a valid email or phone number"})
    let serverResponse 
    if(isLogin) serverResponse = await dispatch(thunkLogin(userSubmission))
    if(isSignup) serverResponse = await dispatch(thunkSignup(userSubmission))

    if (serverResponse) {
      if (serverResponse.phone_number) setErrors({ credential: serverResponse.phone_number });
      else if (serverResponse.email) setErrors({ credential: serverResponse.email });
    } else {
      navigate("/");
    }
  };

  let button
  if(isLogin) button = "Log In"
  if(isSignup) button = "Sign Up"

  return (
    <div className="login-form-page">
      {errors.length > 0 &&
        errors.map((message) => <p key={message}>{message}</p>)}
      <div className="content">
        <form onSubmit={handleSubmit} className="login-form">
          {isSignup && (
            <label>
              {"What's your name"}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
          )}
          <label>
            {"What's your phone number or email"}
            <input
              type="text"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              required
            />
          </label>
          {errors.credential && <p>{errors.credential}</p>}
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {errors.password && <p>{errors.password}</p>}
          <button type="submit">{button}</button>
        </form>
       
        {isLogin && (
          
          <div>
             <div>
              <div className="overlay">or</div>
            </div>
            <button onClick={(e)=>{
              setCredential('b@user.io')
              setPassword('password')
              demoSubmit(e, 'burak')
            }}>Login as Burak</button>

            <button onClick={(e)=>{
              setCredential('g@user.io')
              setPassword('password')
              demoSubmit(e, 'gabe')
            }}>Login as Gabe</button>

            <button onClick={(e)=>{
              setCredential('k@user.io')
              setPassword('password')
              demoSubmit(e, 'katie')
            }}>Login as Katie</button>

            <button onClick={(e)=>{
              setCredential('m@user.io')
              setPassword('password')
              demoSubmit(e, 'mar')
            }}>Login as Mar</button>

            <button onClick={(e)=>{
              setCredential('s@user.io')
              setPassword('password')
              demoSubmit(e, 'sama')
            }}>Login as Sama</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginFormPage;
