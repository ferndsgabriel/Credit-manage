import { useRef, useState } from "react";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

function Login() {
    const [inputType, setInputType] = useState(false);
    const [isLoadingButton, setIsLoadingButton] = useState(false);
    const emailRef = useRef(null);
    const passRef = useRef(null);
    const {handleAuthUser} = useContext(AuthContext);

    function changeInputType() {
        setInputType(!inputType);
    }

    async function handleLogin(e) {
        e.preventDefault();
        const emailValue = emailRef.current.value.trim().toLowerCase();
        const passValue = passRef.current.value;
        
        if (!emailValue || !passValue){
            toast.warning('Por favor, preencha todos os campos.');
            return;
        }
        setIsLoadingButton(true);
        try{
            await handleAuthUser(emailValue, passValue);
        }catch(error){
            console.log(error);
        }finally{
            setIsLoadingButton(false);
        }
    }
    

    return (
    <main className="flex items-center justify-center w-full min-h-screen">
        <section className="flex flex-col items-center justify-center w-full min-h-screen gap-16 p-4 sm:max-w-3xl">
            <img src="./whiteicon.svg" alt="icon" className="w-full max-w-96" />

            <form className="flex flex-col w-full gap-8" onSubmit={handleLogin}>

                <input
                type="text"
                placeholder="Digite seu e-mail:"
                ref={emailRef}
                required={true}
                minLength={10}
                maxLength={50}
                className="w-full p-4 bg-dark5 placeholder:text-dark6 focus:outline-none focus:border-solid focus:border-2"
                />

                <div className="flex items-center justify-between gap-2 p-4 bg-dark5 focus-within:border-solid focus-within:border-2 focus-within:border-white">
                    <input
                        type={inputType ? 'text' : 'password'}
                        placeholder="Sua senha:"
                        ref={passRef}
                        required={true}
                        minLength={7}
                        maxLength={60}
                        className="w-full bg-transparent border-none outline-none placeholder:text-dark6"
                    />

                    <button onClick={changeInputType} className="text-xl" type="button">
                        {inputType ? (
                        <AiOutlineEye />
                        ) : (
                        <AiOutlineEyeInvisible />
                        )}
                    </button>
                </div>

                {!isLoadingButton ? (
                <button type="submit" className="flex items-center justify-center w-full p-4 duration-200 bg-dark4 hover:opacity-75">
                    Logar
                </button>
                ) : (
                <FaSpinner className="m-auto text-2xl animate-spin" />
                )}
                
                <div className="flex items-center justify-between"> 
                    <Link to={"/register"}
                    className="self-start text-sm hover:text-dark6">
                        Registrar
                    </Link>
                    
                    <Link to={"/recovery"}
                    className="self-start text-sm hover:text-dark6">
                        Recuperar senha
                    </Link>
                </div>
            </form>
        </section>
    </main>
    );
}

export default Login;
