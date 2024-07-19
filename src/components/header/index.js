import { useRef } from "react";
import { IoIosMenu, IoMdClose, IoIosSettings, IoIosLogOut } from "react-icons/io";
import { BiSolidPurchaseTagAlt } from "react-icons/bi";
import { FaRegCreditCard } from "react-icons/fa";
import { BsFillPersonFill } from "react-icons/bs";
import { MdOutlineWbSunny, MdOutlineAttachMoney } from "react-icons/md";
import { Link } from "react-router-dom";



function Header(){
    const navRef = useRef(null);

    function openNav(){
        if (navRef.current){
            navRef.current.classList.remove('hidden');
            navRef.current.classList.add('flex');
        }
    }

    function closeNav(){
        if (navRef.current){
            navRef.current.classList.remove('flex');
            navRef.current.classList.add('hidden')
        }
    }

    return(
        <>
            <header className="fixed top-0 left-0 flex items-center justify-between w-full h-20 p-4 bg-dark1 md:hidden">
                <Link to={'/'}>
                    <img src="./navegadoriconwhite.svg" alt="icon"
                    className="w-12"/>
                </Link>

                <button onClick={openNav}>
                    <IoIosMenu className="text-2xl"/>
                </button>
            </header>
            
            <nav ref={navRef} 
            className="fixed top-0 right-0 flex-col items-end hidden h-screen p-6 overflow-auto shadow-2xl bg-dark1 w-80 shadow-black rounded-l-2xl md:flex md:rounded-none md:left-0">

                <button onClick={closeNav} className="md:hidden">
                    <IoMdClose className="text-2xl"/>
                </button>
                
                <Link to={'/'} className="md:w-full">
                    <img src="./navegadoriconwhite.svg" alt="icon"
                    className="hidden w-10 mt-8 md:flex"/>
                </Link>

                <div className="flex flex-col w-full gap-8 mt-8">

                    <div className="flex flex-col items-end w-full gap-4 md:items-start">
                        <span className="text-xs text-dark6">Visualizar</span>
                        <ul className="w-full">
                            <Link>
                                <li className="flex items-center justify-end w-full gap-4 p-2 hover:bg-dark5 md:justify-start">
                                    <MdOutlineAttachMoney className="text-base"/> 
                                    <span className="text-xs">Gastos</span>
                                </li>
                            </Link>
                        </ul>
                    </div>

                    <div className="flex flex-col items-end w-full gap-4 md:items-start">
                        <span className="text-xs text-dark6">Cadastrar</span>
                        <ul className="flex flex-col w-full gap-4">
                            <Link>
                                <li className="flex items-center justify-end w-full gap-4 p-2 hover:bg-dark5 md:justify-start">
                                    <BiSolidPurchaseTagAlt  className="text-base"/> 
                                    <span className="text-xs">Compras</span>
                                </li>
                            </Link>
                            <Link to={'/card'}>
                                <li className="flex items-center justify-end w-full gap-4 p-2 hover:bg-dark5 md:justify-start">
                                    <FaRegCreditCard  className="text-base"/> 
                                    <span className="text-xs">Cartão</span>
                                </li>
                            </Link>
                            <Link to={'/persona'}>
                                <li className="flex items-center justify-end w-full gap-4 p-2 hover:bg-dark5 md:justify-start">
                                    <BsFillPersonFill  className="text-base"/> 
                                    <span className="text-xs">Pessoas</span>
                                </li>
                            </Link>
                        </ul>
                    </div>

                    <div className="flex flex-col items-end w-full gap-4 md:items-start">
                        <span className="text-xs text-dark6">Configurações</span>
                        <ul className="flex flex-col w-full gap-4">
                            <Link>
                                <li className="flex items-center justify-end w-full gap-4 p-2 hover:bg-dark5 md:justify-start">
                                    <IoIosSettings className="text-base"/> 
                                    <span className="text-xs">Conta</span>
                                </li>
                            </Link>
                            <Link>
                                <li className="flex items-center justify-end w-full gap-4 p-2 hover:bg-dark5 md:justify-start">
                                    <MdOutlineWbSunny  className="text-base"/> 
                                    <span className="text-xs">Tema</span>
                                </li>
                            </Link>
                        </ul>
                    </div>

                    <div className="flex flex-col items-end w-full gap-4 md:items-start">
                        <span className="text-xs text-dark6">Conta</span>
                        <ul className="w-full">
                            <Link>
                                <li className="flex items-center justify-end w-full gap-4 p-2 hover:bg-dark5 md:justify-start">
                                    <IoIosLogOut className="text-base"/> 
                                    <span className="text-xs">Sair</span>
                                </li>
                            </Link>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="h-20 md:hidden">

            </div>
        </>
    )
}

export default Header;