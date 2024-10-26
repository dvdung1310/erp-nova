import {getItem} from "../../utility/localStorageControl";

const MainWord = () => {
    const role_id = getItem('role_id')
    console.log(role_id)
    return (
        <div>
            MainWord
        </div>
    );
}
export default MainWord;