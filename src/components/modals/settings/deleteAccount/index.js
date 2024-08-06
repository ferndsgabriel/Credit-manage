import { useState, useContext } from "react";
import { AuthContext } from "../../../../contexts/AuthContext";
import Modal from "../../default";
import { collection, doc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../../../firebase/config";
import { signOut } from 'firebase/auth';

function DeleteAccount({ isOpen, closeModal }) {
    const [loading, setLoading] = useState(false);
    const { userData, signout } = useContext(AuthContext);
    const userRef = doc(db, "Users", userData.Uid);

    async function handleDelete(e) {
        setLoading(true);
        e.preventDefault();

        try {
            const personaQuery = query(collection(db, "Personas"), where('UserRef', '==', userRef));
            const cardQuery = query(collection(db, "Cards"), where('UserRef', '==', userRef));
            const shoppingQuery = query(collection(db, "Shoppings"), where('UserRef', '==', userRef));
            const userQuery = query(collection(db, "Users"), where('Uid', '==', userData.Uid));

            const [getCard, getShopping, getPersonas, getUser] = await Promise.all([
                getDocs(cardQuery),
                getDocs(shoppingQuery),
                getDocs(personaQuery),
                getDocs(userQuery)
            ]);

            const deleteDocuments = async (docs) => {
                const deletePromises = docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deletePromises);
            };

            await deleteDocuments(getCard.docs);
            console.log('Cartões deletados');

            await deleteDocuments(getShopping.docs);
            console.log('Compras deletadas');

            await deleteDocuments(getPersonas.docs);
            console.log('Personas deletadas');

            await deleteDocuments(getUser.docs);
            console.log('Usuário deletado');

            const user = auth.currentUser;
            if (user) {
                await signOut(auth);
                await user.delete();
                console.log('Usuário deletado com sucesso.');
                signout();
            } else {
                console.log('Nenhum usuário está autenticado.');
            }
        } catch (error) {
            console.error('Erro ao deletar documentos ou usuário: ', error);
        } finally {
            setLoading(false);
            closeModal(); 
        }
    }

    return (
        <Modal isOpen={isOpen} closeModal={closeModal}>
            <form className="modalContainer" onSubmit={handleDelete}>
                <h1>Deletar conta</h1>
                <p>Tem certeza de que deseja deletar sua conta?</p>
                <div className="formArea">
                    <div className="buttons">
                        <button className="create" disabled={loading} type="submit">Deletar</button>
                        {!loading ? (
                            <button onClick={closeModal} className="create">Cancelar</button>
                        ) : null}
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default DeleteAccount;