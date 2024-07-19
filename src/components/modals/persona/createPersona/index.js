import { useRef, useState } from "react";
import Modal from "../../default";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AuthContext } from "../../../../contexts/AuthContext";
import { addDoc, collection, doc } from "firebase/firestore";
import { db } from "../../../../firebase/config";

function CreatePersona({ isOpen, closeModal }) {
    const inputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const { userData } = useContext(AuthContext);
    const uid = userData.Uid;

    async function handleCreate(e) {
        e.preventDefault();
        const name = inputRef.current?.value;

        if (!name) {
            toast.warning('Preencha o nome do persona');
            return;
        }
        setLoading(true);

        const userRef = doc(db, 'Users', uid);

        const date = new Date();
        const timestamp = date.getTime();
        
        try {
            await addDoc(collection(db, "Personas"), {
                Id: timestamp,
                Name: name,
                UserRef: userRef
            });
            toast.success('Persona criada com sucesso');
            closeModal();
        } catch (error) {
            toast.error('Erro ao criar persona');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modalContainer" onSubmit={handleCreate}>
                <h1>Criar persona</h1>
                <p>Personas são todos aqueles que podem realizar compras com o cartão.</p>
                <div className="formArea">
                    <input 
                        placeholder="Digite um nome:" 
                        ref={inputRef} 
                        className="typeText" 
                        required={true} 
                        minLength={3} 
                        maxLength={30} 
                        autoFocus={true}
                    />
                    <div className="buttons">
                        <button className="create" disabled={loading} type="submit">Criar</button>
                        {!loading ? (
                            <button onClick={closeModal} className="create">Cancelar</button>
                        ) : null}
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default CreatePersona;
