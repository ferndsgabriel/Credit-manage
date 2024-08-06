import { useEffect, useState } from "react";
import Header from "../../components/header";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import Loading from "../../components/loading";
import { FaAngleLeft, FaAngleRight} from "react-icons/fa";
import formatPrice from "../../utils/formatPrice";
import formatDateBr from "../../utils/formatDateBr";
import { useNavigate } from "react-router-dom";

function Start(){

    const {userData} = useContext(AuthContext);
    const uid = userData.Uid;
    const userRef = doc(db, "Users", uid);
    const [shoppings, setShoppings] = useState([{}]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState();
    const [filterMonth, setFilterMonth] = useState(0);
    const [limitFilter, setLimitFilter] = useState(false);
    const navigate = useNavigate();


    // bloco para obter o nome dos meses
    const currentDate = new Date();
    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    
    let adjustedMonthIndex = (currentDate.getMonth() + filterMonth) % 12;
    let adjustedYear = currentDate.getFullYear();
    
    if (currentDate.getMonth() + filterMonth < 0) {
        adjustedYear -= 1;
    } else if (currentDate.getMonth() + filterMonth >= 12) {
        adjustedYear += 1; 
    }
    if (adjustedMonthIndex < 0) {
        adjustedMonthIndex += 12;
    }
    const adjustedMonthName = monthNames[adjustedMonthIndex];
    ///////////////////////////////////////////////////////////////////////////////
    
    useEffect(() => {
        async function getTotal() {
            const shoppingsQuery = query(collection(db, "Shoppings"),
                where('UserRef', '==', userRef));
            
            const getShoppings = await getDocs(shoppingsQuery);
            
            if (!getShoppings.empty) {
                let total = 0;
                let limit = false; 
                let list = [] 
                for (const item of getShoppings.docs) {   
                    const calculateWithMonth = parseInt(item.data().RemainingInstallments) - filterMonth;
                    if (calculateWithMonth > 0) {
                        const withInstallments = (item.data().Price / item.data().Installments);
                        total += parseInt(withInstallments);
                        list.push(item.data());
                    } 
                }

                for (const item of getShoppings.docs) {
                    const calculateWithMonth = (parseInt(item.data().RemainingInstallments) - (filterMonth + 1));
                    if (calculateWithMonth  > 0) {
                        limit = true; 
                        break;
                    }
                }
    
                setTotal(total);
                setLimitFilter(limit);
                setShoppings(list);
            } else {
                return;
            }
        }
    
        try {
            getTotal();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [filterMonth]);
    
    function navigatePage(id){
        navigate(`/shopping/${id}`)
    }
    

    if (loading){
        return <Loading/>
    }

    return(
        <>
            <Header/>
            <main className="flex flex-col w-full gap-8 px-4 py-12 mainScreen ">
                <h1 className="pageTitle">Meus gastos</h1>
                    <section className="flex flex-col gap-8">
                        <div className="flex items-center justify-between gap-2">                        
                            <h2>Total: R$ {total},00</h2>
                            <div className="flex items-center gap-2">
                                <button onClick={()=>setFilterMonth(filterMonth - 1)} 
                                disabled={filterMonth <= 0 ? true:false}
                                className="p-2 rounded-full disabled:cursor-not-allowed bg-dark6 disabled:opacity-50 ">
                                    <FaAngleLeft/>
                                </button>

                                <button onClick={()=>setFilterMonth(filterMonth + 1)}
                                disabled={!limitFilter}
                                className="p-2 rounded-full disabled:cursor-not-allowed bg-dark6 disabled:opacity-50 ">
                                    <FaAngleRight/>
                                </button>
                            </div>
                        </div>
                        <p>{adjustedMonthName} - {adjustedYear}</p>
                    </section>
                    {shoppings && shoppings.length > 0 ?(
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
                                {shoppings.map((item, index)=>{
                                    return(
                                        <tr onClick={()=>navigatePage(item.Id)} 
                                        key={index} className="cursor-pointer hover:opacity-60">
                                            <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1" >{item.Name}</td>
                                            <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1">R$ { formatPrice(item.Price/item.Installments)}</td>
                                            <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1"> {item.RemainingInstallments}/{item.Installments}</td>
                                            <td className="hidden px-4 py-1 text-sm border-2 bg-dark4 border-dark1 md:table-cell">{formatDateBr(item.ShoppingDate)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    ):null}
            </main>
        </>
    )
}

export default Start;