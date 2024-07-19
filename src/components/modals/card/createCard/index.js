import Modal from "../../default";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { db } from "../../../../firebase/config";
import { AuthContext } from "../../../../contexts/AuthContext";
import { useContext } from "react";
import { addDoc, collection, doc } from "firebase/firestore";

function CreateCard({ isOpen, closeModal }) {
    const [loading, setLoading] = useState(false);
    const [indexColor, setIndexColor] = useState(0);
    const nameRef = useRef(null);
    const dayRef = useRef(null);
    const limitRef = useRef(null);
    const { userData } = useContext(AuthContext);
    const uid = userData.Uid;

    const colors = [
        '#33204E',
        '#67634D',
        '#2E3340',
        '#000000' 
    ];
    
    async function handleCreate(e) {
        e.preventDefault();
        
        const nameValue = nameRef.current?.value;
        const dayValue = dayRef.current?.value;
        const limitValue = limitRef.current?.value;

        if (!nameValue || !dayValue || !limitValue) {
            toast.warning('Por favor, preencha todos os campos');
            return;
        }
        if (dayValue <= 0 || limitValue <= 0) {
            toast.warning('Os valores devem ser maiores que zero');
            return;
        }
        if (dayValue > 30) {
            toast.warning('Dia de fechamento do cartão inválido');
            return;
        }
        setLoading(true);
        
        const date = new Date();
        const timestamp = date.getTime();

        const userRef = doc(db, "Users", uid);

        try {
            await addDoc(collection(db, "Cards"), {
                Id: timestamp,
                Name: nameValue,
                PayDay: parseInt(dayValue),
                Limit: parseInt(limitValue),
                Color: colors[indexColor].toString(),
                UserRef: userRef
            });
            toast.success('Cartão criado com sucesso');
            closeModal();
        } catch (error) {
            console.error("Erro ao criar cartão:", error);
            toast.error('Erro ao criar cartão');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modalContainer" onSubmit={handleCreate}>
                <h1>Criar cartão</h1>
                <p>Os cartões são utilizados para registrar as compras realizadas.</p>
                <div className="formArea">
                    <input 
                        placeholder="Digite um nome:" 
                        className="typeText" 
                        required={true} 
                        minLength={3} 
                        maxLength={30} 
                        autoFocus={true}
                        ref={nameRef}
                    />
                    <div className="flex items-center gap-4">
                        <input 
                            placeholder="Digite o dia de fechamento" 
                            className="typeText" 
                            required={true} 
                            minLength={1} 
                            maxLength={2} 
                            type="number"
                            ref={dayRef}
                        />
                        <input 
                            placeholder="Digite o limite do cartão" 
                            className="typeText" 
                            required={true} 
                            minLength={3} 
                            maxLength={10} 
                            type="number"
                            ref={limitRef}
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
                        <button className="create" disabled={loading} type="submit">Criar</button>
                        {!loading ? (
                            <button onClick={closeModal} className="create">Cancelar</button>
                        ) : null}
                    </div>
                </div>
            </form>
        </Modal>
    )
}

export default CreateCard;
