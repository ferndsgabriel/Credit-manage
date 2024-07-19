import { useEffect, useState } from "react";
import Modal from "../../default";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AuthContext } from "../../../../contexts/AuthContext";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../../../firebase/config";

function EditPersona({ isOpen, closeModal, personaId, personaName }) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const { userData } = useContext(AuthContext);
    const uid = userData.Uid;

    useEffect(() => {
        if (isOpen) {
            setName(personaName);
        }
    }, [isOpen, personaName]);

    async function handleEdit(e) {
        e.preventDefault();

        if (!name) {
            toast.warning('Preencha o nome do persona');
            return;
        }
        setLoading(true);

        try {
            const id = parseInt(personaId);
            const queryItens = query(collection(db, "Personas"), where('Id', '==', id));
            const getQuery = await getDocs(queryItens);

            if (!getQuery.empty) {
                const firstDoc = getQuery.docs[0];
                const docRef = doc(db, "Personas", firstDoc.id);
                await updateDoc(docRef, { Name: name });
                toast.success('Persona atualizada com sucesso');
                closeModal();
            } else {
                toast.warning('Nenhuma persona encontrada com esse ID');
                closeModal();
            }
        } catch (error) {
            console.error("Erro ao editar persona:", error);
            toast.error('Erro ao editar persona');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modalContainer" onSubmit={handleEdit}>
                <h1>Edite persona</h1>
                <p>Edite o nome da persona.</p>
                <div className="formArea">
                    <input 
                        placeholder="Digite um nome:" 
                        className="typeText" 
                        required={true} 
                        minLength={3} 
                        maxLength={30} 
                        autoFocus={true}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <div className="buttons">
                        <button className="create" disabled={loading} type="submit">Editar</button>
                        {!loading ? (
                            <button onClick={closeModal} className="create">Cancelar</button>
                        ) : null}
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default EditPersona;
