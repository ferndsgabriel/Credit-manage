import { useEffect } from "react";

function Modal({children, isOpen, closeModal}){

    function dontClose(e){
        e.stopPropagation();
    }


    useEffect(()=>{
        function closeWithEsc(e){
            if (e.key === 'Escape'){
                closeModal();
            }else{
                return;
            }
        }
        document.addEventListener('keydown',closeWithEsc);

        return(()=>{
            document.removeEventListener('keydown',closeWithEsc);
        })
    },[])
    
    
    return(
        <>
            {isOpen?(
                <div onClick={closeModal}
                className="fixed top-0 left-0 flex items-center justify-center w-full h-screen bg-dark5">
                    <div className='w-full max-w-xl p-4 overflow-auto bg-dark1'
                    onClick={(e)=>dontClose(e)}>
                        {children}
                    </div>
                </div>
            ):null}
        </>
    )
}

export default Modal;