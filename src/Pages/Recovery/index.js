import { useRef, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

function Recovery() {
    const [isLoadingButton, setIsLoadingButton] = useState(false);
    const emailRef = useRef(null);
    const {sendCodRecovery} = useContext(AuthContext);

    async function handleRecovery(e) {
        e.preventDefault();

        const emailValue = emailRef.current.value.trim().toLowerCase();  

        if (!emailValue){
            toast.warning('Digite seu e-mail');
            return;
        }

        setIsLoadingButton(true);
        
        try{
            await sendCodRecovery(emailValue);
        }catch(error){
            console.log(error);
            toast.error('Email não encontrado')
        }finally{
            setIsLoadingButton(false);
        }
    }
    

    return (
    <main className="flex items-center justify-center w-full min-h-screen">
        <section className="flex flex-col items-center justify-center w-full min-h-screen gap-16 p-4 sm:max-w-3xl">
            <img src="./whiteicon.svg" alt="icon" className="w-full max-w-96" />
            <form className="flex flex-col w-full gap-8" onSubmit={handleRecovery}>

                <input
                type="text"
                placeholder="Digite seu e-mail:"
                ref={emailRef}
                required={true}
                minLength={10}
                maxLength={50}
                className="w-full p-4 bg-dark5 placeholder:text-dark6 focus:outline-none focus:border-solid focus:border-2"
                />

                {!isLoadingButton ? (
                <button type="submit" className="flex items-center justify-center w-full p-4 duration-200 bg-dark4 hover:opacity-75">
                    Recuperar
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

export default Recovery;
