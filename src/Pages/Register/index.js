import { useRef, useState } from "react";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

function Register() {
    const [inputType, setInputType] = useState(false);
    const [isLoadingButton, setIsLoadingButton] = useState(false);
    const nameRef = useRef(null);
    const lastNameRef = useRef(null);
    const emailRef = useRef(null);
    const confirmPassRef = useRef(null);
    const passwordRef = useRef(null);
    
    const {handleCreateUser} = useContext(AuthContext);

    function changeInputType() {
        setInputType(!inputType);
    }

    async function handleRegister(e) {
        e.preventDefault();

        const namevalue = nameRef.current?.value;
        const lastnamevalue = lastNameRef.current?.value;
        const emailValue = emailRef.current?.value;
        const passValue = passwordRef.current?.value;
        const confirmPassValue = confirmPassRef.current?.value;
        
        if (!namevalue || !lastnamevalue || !emailValue || !passValue || !confirmPassValue){
            toast.warning('Por favor, preencha todos os campos.');
            return;
        }
        if (passValue !== confirmPassValue){
            toast.warning('As senhas não coincidem.');
            return;
        }

        if (namevalue.includes(' ') || lastnamevalue.includes(' ')) {
            toast.warning('O nome não pode conter espaços.');
            return;
        }
        
        setIsLoadingButton(true);
        
        const data = {
            name:namevalue.trim(),
            lastname:lastnamevalue.trim(),
            email:emailValue.trim(),
            pass:passValue
        }

        try{
            await handleCreateUser(data);
        }catch(error){
            console.log(error)
        }finally{
            setIsLoadingButton(false);
        }
    }
    

    return (
    <main className="flex items-center justify-center w-full min-h-screen">
        <section className="flex flex-col items-center justify-center w-full min-h-screen gap-16 p-4 sm:max-w-3xl">
            <Link to={'/'}>
                <img src="./whiteicon.svg" alt="icon" className="w-full max-w-96" />
            </Link>
            
            <form className="flex flex-col w-full gap-8" onSubmit={handleRegister}>
                <div className="flex gap-4">
                    <input type="text" placeholder="Digite seu primeiro nome:" ref={nameRef} minLength={3} maxLength={50} required={true}
                    className="w-full p-4 bg-dark5 focus:outline-none focus:border-2 placeholder:text-dark6 "/>

                    <input type="text" placeholder="Seu último nome:" ref={lastNameRef} minLength={3} maxLength={50} required={true}
                    className="w-full p-4 bg-dark5 focus:outline-none focus:border-2 placeholder:text-dark6 "/>
                </div>

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
                        placeholder="Confirmar senha:"
                        ref={passwordRef}
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


                <div className="flex items-center justify-between gap-2 p-4 bg-dark5 focus-within:border-solid focus-within:border-2 focus-within:border-white">
                    <input
                        type={inputType ? 'text' : 'password'}
                        placeholder="Confirmar senha:"
                        ref={confirmPassRef}
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
                    Criar
                </button>
                ) : (
                <FaSpinner className="m-auto text-2xl animate-spin" />
                )}

                <Link to={"/"}
                className="self-start hover:text-dark6">
                    Logar
                </Link>
            </form>

        </section>
    </main>
    );
}

export default Register;
