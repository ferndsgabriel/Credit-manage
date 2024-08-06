import Modal from "../../default";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { db } from "../../../../firebase/config";
import { getDocs, collection, doc, query, updateDoc, where } from "firebase/firestore";

function EditCard({ isOpen, closeModal, item }) {
    const [loading, setLoading] = useState(false);
    const [indexColor, setIndexColor] = useState(0);
    const [nameInput, setNameInput] = useState('');
    const [dayInput, setDayInput] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setNameInput(item.Name);
            setDayInput(item.PayDay);

            const colorIndex = colors.indexOf(item.Color);
            setIndexColor(colorIndex !== -1 ? colorIndex : 0);
        } else {
            resetForm();
        }
    }, [isOpen]);

    function resetForm() {
        setNameInput('');
        setDayInput(null);
        setIndexColor(0);
    }
    
    const colors = [
        '#33204E',
        '#67634D',
        '#2E3340',
        '#000000' 
    ];
    
    async function handleEdit(e) {
        e.preventDefault();

        if (!nameInput || !dayInput) {
            toast.warning('Por favor, preencha todos os campos');
            return;
        }
        if (dayInput <= 0) {
            toast.warning('Dia de fechamento do cartão inválido');
            return;
        }
        if (dayInput > 30) {
            toast.warning('Dia de fechamento do cartão inválido');
            return;
        }
        setLoading(true);
        
        const queryCard = query(collection(db, "Cards"), where('Id', '==', item.Id));
        const getCard = await getDocs(queryCard);

        if (!getCard.empty){
            const firstDoc = getCard.docs[0];
            const docRef = doc(db, "Cards", firstDoc.id);
            await updateDoc(docRef,{
                Name: nameInput,
                PayDay: parseInt(dayInput),
                Color: colors[indexColor].toString(),
            }).then(()=>{
                toast.success('Cartão editado com sucesso');
                closeModal();
            }).catch((error)=>{
                toast.error('Erro ao editar cartão');
                console.log(error)
            }).finally(()=>{
                setLoading(false)
            })
        }else{
            toast.warning('Nenhum cartão encontrado com esse ID');
            closeModal();
        }
    }

    return (
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modalContainer" onSubmit={handleEdit}>
                <h1>Editar cartão</h1>
                <p>Atualize as informações do seu cartão.</p>
                <div className="formArea">
                    <input 
                        placeholder="Digite um nome:" 
                        className="typeText" 
                        required={true} 
                        minLength={3} 
                        maxLength={30} 
                        autoFocus={true}
                        value={nameInput}
                        onChange={(e)=>setNameInput(e.target.value)}
                    />
                    <div className="flex items-center gap-4">
                        <input 
                            placeholder="Digite o dia de fechamento" 
                            className="typeText" 
                            required={true} 
                            minLength={1} 
                            maxLength={2} 
                            type="number"
                            value={dayInput}
                            onChange={(e)=>setDayInput(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>Cor do cartão</p>
                        <ul className="flex items-center gap-4">
                            <li onClick={() => setIndexColor(0)} 
                                className={`cursor-pointer block w-8 bg-[#33204E] rounded-full span aspect-square border-solid border-2 border-dark5 ${indexColor === 0 ? 'border-white' : ''}`}>
                            </li>
                            <li onClick={() => setIndexColor(1)} 
                                className={`cursor-pointer block w-8 bg-[#67634D] rounded-full span aspect-square border-solid border-2 border-dark5 ${indexColor === 1 ? 'border-white' : ''}`}>
                            </li>
                            <li onClick={() => setIndexColor(2)} 
                                className={`cursor-pointer block w-8 bg-[#2E3340] rounded-full span aspect-square border-solid border-2 border-dark5 ${indexColor === 2 ? 'border-white' : ''}`}>
                            </li>
                            <li onClick={() => setIndexColor(3)} 
                                className={`cursor-pointer block w-8 bg-[#000000] rounded-full span aspect-square border-solid border-2 border-dark5 ${indexColor === 3 ? 'border-white' : ''}`}>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="buttons">
                        <button className="create" disabled={loading} type="submit">Editar</button>
                        {!loading ? (
                            <button onClick={closeModal} className="create">Cancelar</button>
                        ) : null}
                    </div>
                </div>
            </form>
        </Modal>
    )
}

export default EditCard;
