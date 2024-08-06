import { doc, updateDoc } from "firebase/firestore";
import Header from "../../components/header";
import { AuthContext } from "../../contexts/AuthContext";
import { useContext, useRef, useState } from "react";
import {toast} from "react-toastify";
import { db, auth } from "../../firebase/config";
import zxcvbn from 'zxcvbn';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import DeleteAccount from "../../components/modals/settings/deleteAccount";

function Settings(){
    const {userData,signout} = useContext(AuthContext);
    const [name, setName] = useState(userData.Name? userData.Name : '');
    const [lastName, setLastName] = useState(userData.LastName? userData.LastName : '');
    const [inputEdit, setInputEdit] = useState(true);
    const [inputEditPass, setInputEditPass] = useState(true);
    const [loadingButton, setLoadingButton] = useState(false);
    const [loadingButtonPass, setLoadingButtonPass] = useState(false);
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const userRef = doc(db, "Users", userData.Uid);
    const [isOpenDelete, setIsOpenDelete] = useState(false);


    function handleReset(){
        setName(userData.Name? userData.Name : '');
        setLastName(userData.LastName? userData.LastName : '');
        setInputEdit(true);
    }

    function handleResetPass(){
        setOldPass('');
        setNewPass('');
        setInputEditPass(true);
    }

    async function handleEdit(e){
        e.preventDefault();

        if (!name || !lastName){
            toast.warning('Por favor, preencha todos os campos.');
            return;
        }
        if (name.includes(' ') || lastName.includes(' ')) {
            toast.warning('O nome não pode conter espaços.');
            return;
        }
        setLoadingButton(true);

        if (name === userData.Name && setName === userData.LastName){
            setLoadingButton(false);
            return;
        }else{
            await updateDoc(userRef,{
                Name:name,
                LastName:lastName
            }).then(()=>{
                toast.success('Nome atualizado com sucesso');
            }).catch((error)=>{
                console.log(error);
                toast.error('Erro ao atualizar nome')
            }).finally(()=>{
                setLoadingButton(false);
                setInputEdit(true);
            })
        }
    }

    async function handlePass(e){
        e.preventDefault();

        if (!oldPass || !newPass){
            toast.warning('Por favor, preencha todos os campos.');
            return;
        }

        if (zxcvbn(newPass).score < 3) {
            toast.warning('A senha deve conter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais');
            return;
        }
        setLoadingButtonPass(true);

        const user = auth.currentUser;
        if (user) {
            const credential = EmailAuthProvider.credential(user.email, oldPass);
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, newPass).then(()=>{
                    toast.success('Senha alterada com sucesso')
                }).catch((error)=>{
                    console.log(error);
                    toast.error('Erro ao alterar a senha.');
                }).finally(()=>{
                    setLoadingButtonPass(false);
                    setInputEditPass(true);
                })
        } else {
            toast.error('Erro ao alterar a senha.');
            setLoadingButtonPass(false);
            setInputEditPass(true);
        }

    }

    function openModalDelete(){
        setIsOpenDelete(true);
    }
    function closeModalDelete(){
        setIsOpenDelete(false);
    }


    return(
        <>
            <Header/>
            <main className="flex flex-col w-full gap-8 px-4 py-12 mainScreen">
                <h1 className="pageTitle">Conta</h1>
                <section className="flex flex-col gap-4">
                    <h2>Editar</h2>
                    <form className="flex flex-col gap-4" onSubmit={handleEdit}>
                        <input type="text" placeholder="Seu primeiro nome:" disabled={inputEdit} minLength={3} maxLength={50} required={true}
                        className="w-full max-w-md p-4 bg-dark1 disabled:text-gray-400" value={name} onChange={(e)=>setName(e.target.value)}/>
                        <input type="text" placeholder="Seu último nome:" disabled={inputEdit} minLength={3} maxLength={50} required={true}
                        className="w-full max-w-md p-4 bg-dark1 disabled:text-gray-400" value={lastName} onChange={(e)=>setLastName(e.target.value)}/> 

                        <div className="flex items-center gap-4 mt-4">

                            {!inputEdit ? (
                                <button className="create" type="submit" disabled={loadingButton}>
                                    Salvar
                                </button>
                            ):null}

                            {inputEdit ? (
                                <button className="create" type="reset"
                                onClick={()=>setInputEdit(false)}>
                                    Editar
                                </button>
                            ):(
                                <button className="create" type="reset"
                                onClick={handleReset}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="flex flex-col gap-4">
                    <h2>Alterar senha</h2>
                    <form className="flex flex-col gap-4" onSubmit={handlePass}>
                        <input type="password" placeholder="Sua antiga senha:" required={true} minLength={7} maxLength={60}
                        className="w-full max-w-md p-4 bg-dark1 disabled:text-gray-400" disabled={inputEditPass} 
                        value={oldPass} onChange={(e)=>setOldPass(e.target.value)}/>

                        <input type="password" placeholder="Sua nova senha:" required={true} minLength={7} maxLength={60}
                        className="w-full max-w-md p-4 bg-dark1 disabled:text-gray-400" disabled={inputEditPass}
                        value={newPass} onChange={(e)=>setNewPass(e.target.value)}/> 

                        <div className="flex items-center gap-4 mt-4">

                        {!inputEditPass ? (
                            <button className="create" type="submit" disabled={loadingButtonPass}>
                                Salvar
                            </button>
                        ):null}

                        {inputEditPass ? (
                            <button className="create" type="reset"
                            onClick={()=>setInputEditPass(false)}>
                                Editar
                            </button>
                        ):(
                            <button className="create" type="reset"
                            onClick={handleResetPass}>
                                Cancelar
                            </button>
                        )}
                        </div>
                    </form>
                </section>
                <section className="flex flex-col gap-4">
                    <h2>Minha conta</h2>
                    <button className="self-start create" onClick={openModalDelete}>Deletar conta</button>
                    <DeleteAccount isOpen={isOpenDelete} closeModal={closeModalDelete}/>
                </section>
            </main>
        </>
    )
}

export default Settings;