import Header from "../../components/header";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { collection, doc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import Loading from "../../components/loading";
import CreateShopping from "../../components/modals/shopping/createShopping";
import formatDateBr from "../../utils/formatDateBr";
import addZero from "../../utils/addZero";
import { useNavigate } from "react-router-dom";
import formatPrice from "../../utils/formatPrice";

function Shoppings() {
    const { userData } = useContext(AuthContext);
    const uid = userData.Uid;
    const [isOpenCreate, setIsOpenCreate] = useState(false);
    const [shoppingList, setShoppingList] = useState([]);
    const [shoppingListThisMonth, setShoppingListThisMonth] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    function openModal() {
        setIsOpenCreate(true);
    }

    
    const closeModal = useCallback (() =>{
        setIsOpenCreate(false);
    },[isOpenCreate]) 
        

    function navigatePage(id){
        navigate(`/shopping/${id}`)
    }

    useEffect(() => {      
        async function getShoppings(){
            const userRef = doc(db, "Users", uid);
            
            const queryShopping = query(
                collection(db, "Shoppings"), 
                where('UserRef', '==', userRef),
                orderBy('ShoppingDate', 'desc')
            );
            const getMyQuery = await getDocs(queryShopping);
        
            if (!getMyQuery.empty){
                const date = new Date();
                const getMonth = (date.getMonth() + 1);
                const getYear = date.getFullYear();
                const formatToFind = `${getYear}-${addZero(getMonth)}`;
                
                function formatToFindDB(value){
                    return value.substring(0, 7);
                }
                
                let listThisMonth = [];
                let list = [];
                getMyQuery.forEach((item)=>{
                    if (formatToFindDB(item.data().ShoppingDate) == formatToFind){
                        listThisMonth.push(item.data());
                    } else {
                        list.push(item.data());
                    }
                });
                setShoppingList(list);
                setShoppingListThisMonth(listThisMonth);
            }
        }
        getShoppings().then(()=>{
            console.log('get sucess');
        }).catch((error)=>{
            console.log(error);
        }).finally(()=>{
            setLoading(false);
        })
        
    }, [closeModal]);

    
    if (loading){
        return <Loading/>
    }

    return (
        <>
            <Header />
            <main className="flex flex-col w-full gap-8 px-4 py-12 mainScreen">
                <h1 className="pageTitle">Compras</h1>
                <section>
                    <button className="create" onClick={openModal}>
                        Criar
                    </button>
                    <CreateShopping isOpen={isOpenCreate} closeModal={closeModal} />
                </section>

                
                <section className="flex flex-col gap-4">
                {shoppingList && shoppingList.length > 0 || shoppingListThisMonth && shoppingListThisMonth.length > 0?(
                    <>
                        {shoppingListThisMonth && shoppingListThisMonth.length > 0 ?(
                            <>
                                <h2 className="text-xl">Esse mês</h2>
                                <table className="">
                                    <thead className="pb-16">
                                        <tr>
                                            <th className="pb-2 text-start">Nome</th>
                                            <th className="pb-2 text-start">Preço</th>
                                            <th className="pb-2 text-start">Parcelas</th>
                                            <th className="hidden pb-2 text-start md:table-cell">Dia</th>
                                        </tr>
                                    </thead>
                                        <tbody className="mt-4">
                                            {shoppingListThisMonth.map((item, index)=>{
                                                return(
                                                    <tr key={index} className="cursor-pointer hover:opacity-60"
                                                    onClick={()=>navigatePage(item.Id)}>
                                                        <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1">{item.Name}</td>
                                                        <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1">R$ { formatPrice(item.Price)}</td>
                                                        <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1">{item.Installments}</td>
                                                        <td className="hidden px-4 py-1 text-sm border-2 bg-dark4 border-dark1 md:table-cell">{formatDateBr(item.ShoppingDate)}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                </table>
                            </>
                        ):null}
                        {shoppingList && shoppingList.length > 0 ?(
                                <>
                                    <h2 className="text-xl">Todas</h2>
                                    <table className="">
                                        <thead className="pb-16">
                                            <tr>
                                                <th className="pb-2 text-start">Nome</th>
                                                <th className="pb-2 text-start">Preço</th>
                                                <th className="pb-2 text-start">Parcelas</th>
                                                <th className="hidden pb-2 text-start md:table-cell">Dia</th>
                                            </tr>
                                        </thead>
                                            <tbody className="mt-4">
                                                {shoppingList.map((item, index)=>{
                                                    return(
                                                        <tr onClick={()=>navigatePage(item.Id)} 
                                                        key={index} className="cursor-pointer hover:opacity-60">
                                                            <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1" >{item.Name}</td>
                                                            <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1">R$ { formatPrice(item.Price)}</td>
                                                            <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1">{item.Installments}</td>
                                                            <td className="hidden px-4 py-1 text-sm border-2 bg-dark4 border-dark1 md:table-cell">{formatDateBr(item.ShoppingDate)}</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                    </table>
                                </>
                            ):null}
                        </>
                    ) :(
                        <p className="text-dark6">Nenhuma compra cadastrada ainda :(</p>
                    )}
                </section>
            </main>
        </>
    )
}

export default Shoppings;
