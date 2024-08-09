import { useEffect, useState } from "react";
import Header from "../../components/header";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import Loading from "../../components/loading";
import { FaAngleLeft, FaAngleRight} from "react-icons/fa";
import formatPrice from "../../utils/formatPrice";
import formatDateBr from "../../utils/formatDateBr";
import { Await, useNavigate } from "react-router-dom";

function Start(){

    const {userData} = useContext(AuthContext);
    const uid = userData.Uid;
    const userRef = doc(db, "Users", uid);
    const [shoppings, setShoppings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState('00');
    const [filterMonth, setFilterMonth] = useState(0);
    const [limitFilter, setLimitFilter] = useState(false);
    const [cards, setCards] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [cardRef, setCardRef] = useState(null);
    const [personasRef, setPersonasRef] = useState(null);
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

        setLoading(true);
        try {
            getTotal();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [filterMonth]);

    useEffect(()=>{
        async function getCards(){
            const cardQuery = query(collection(db,"Cards"), where('UserRef', '==', userRef));
            const getCards = await getDocs(cardQuery);         
            let list = [];
            if (!getCards.empty){
                getCards.forEach((item)=>{
                    list.push(item.data());
                })
            }
            setCards(list);
        }
        async function getPersonas(){
            const personasQuery = query(collection(db,"Personas"), where('UserRef', '==', userRef));
            const getPersonas = await getDocs(personasQuery);         
            let list = [];
            if (!getPersonas.empty){
                getPersonas.forEach((item)=>{
                    list.push(item.data());
                })
            }
            setPersonas(list);
        }

        setLoading(true);
        try {
            getCards();
            getPersonas();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    },[]);
    
    function navigatePage(id){
        navigate(`/shopping/${id}`)
    }
    
    const withFilters = shoppings.filter((item) => {
        if (cardRef && personasRef) {
            return item.CardRef.id === cardRef.id && item.PersonaRef.id === personasRef.id;
        }
        else if (cardRef) {
            return item.CardRef.id === cardRef.id;
        } else if (personasRef) {
            return item.PersonaRef.id === personasRef.id;
        }
        return [];
    });

    async function handleChangeCard(e) {
        const id = e.target.value;
        if (id == 0) {
            setCardRef(null);
        } else {
            const cardQuery = query(collection(db, "Cards"), where('Id', '==', parseInt(id)));
            const cardSnapshot = await getDocs(cardQuery);
            
            if (!cardSnapshot.empty) {
                const firstDoc = cardSnapshot.docs[0];
                const cardRef = firstDoc.ref; 
                setCardRef(cardRef); 
            } else {
                console.log("erro ao buscar itens");
            }
        }
    }
    
    async function handleChangePersona(e) {
        const id = e.target.value;
        if (id == 0) {
            setCardRef(null);
        } else {
            const personaQuery = query(collection(db,"Personas"), where('Id', '==', parseInt(id)));
            const personaSnapshot = await getDocs(personaQuery);
            
            if (!personaSnapshot.empty) {
                const firstDoc = personaSnapshot.docs[0];
                const PersonaRef = firstDoc.ref; 
                setPersonasRef(PersonaRef); 
                
            } else {
                console.log("erro ao buscar itens");
            }
        }
    }
    
    if (loading){
        return <Loading/>
    }


    return(
        <>
            <Header/>
            <main className="flex flex-col w-full gap-8 px-4 py-12 mainScreen ">
                    <h1 className="pageTitle">
                        Meus gastos
                    </h1>

                    <section className="flex items-center justify-between gap-2">
                        <p>{adjustedMonthName} - {adjustedYear}</p>                        
                        
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
                    </section>
                    
                    <article className="flex items-center w-full gap-4 max-w-96">
                            {cards && cards.length > 0 && (
                                <div className="flex flex-col w-full gap-2">
                                    <p className="mb-3">Cartões</p>
                                    <select onChange={handleChangeCard} className="w-full p-2">
                                        <option value={0}>
                                            Todos
                                        </option>
                                        {cards.map((item, index)=>{
                                            return(
                                                <option 
                                                key={`${item} - ${index}`}
                                                value={item.Id}>
                                                    {item.Name}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                            )}

                            {personas && personas.length > 0 && (
                                <div className="flex flex-col w-full gap-2">
                                    <p className="mb-3">Quem usou</p>
                                    <select onChange={handleChangePersona} className="w-full p-2">
                                        <option value={0}>
                                            Todos
                                        </option>
                                        {personas.map((item, index)=>{
                                            return(
                                                <option 
                                                key={`${item} - ${index}`}
                                                value={item.Id}>
                                                    {item.Name}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                            )}
                    </article>
                    
                    {shoppings && shoppings.length > 0 &&(
                        <div className="flex flex-col w-full gap-6">
                            <h2 className="font-bold">Total: R$ {total},00</h2> 
                            <table>
                            <thead className="pb-16">
                                <tr>
                                    <th className="pb-2 text-start">Nome</th>
                                    <th className="pb-2 text-start">Preço</th>
                                    <th className="pb-2 text-start">Parcelas</th>
                                    <th className="hidden pb-2 text-start md:table-cell">Dia</th>
                                </tr>
                            </thead>
                            <tbody className="mt-4">
                                {cardRef ?(
                                    withFilters.map((item, index)=>{
                                        return(
                                            <tr onClick={()=>navigatePage(item.Id)} 
                                            key={index} className="cursor-pointer hover:opacity-60">
                                                <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1" >{item.Name}</td>
                                                <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1">R$ { formatPrice(item.Price/item.Installments)}</td>
                                                <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1"> {item.RemainingInstallments}/{item.Installments}</td>
                                                <td className="hidden px-4 py-1 text-sm border-2 bg-dark4 border-dark1 md:table-cell">{formatDateBr(item.ShoppingDate)}</td>
                                            </tr>
                                        )
                                    })
                                ):(
                                    shoppings.map((item, index)=>{
                                        return(
                                            <tr onClick={()=>navigatePage(item.Id)} 
                                            key={index} className="cursor-pointer hover:opacity-60">
                                                <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1" >{item.Name}</td>
                                                <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1">R$ { formatPrice(item.Price/item.Installments)}</td>
                                                <td className="px-4 py-1 text-sm border-2 bg-dark4 border-dark1"> {item.RemainingInstallments}/{item.Installments}</td>
                                                <td className="hidden px-4 py-1 text-sm border-2 bg-dark4 border-dark1 md:table-cell">{formatDateBr(item.ShoppingDate)}</td>
                                            </tr>
                                        )
                                    })
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
            </main>
        </>
    )
}

export default Start;