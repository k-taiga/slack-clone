import {useAppDispatch} from "../app/hooks";
import {googleSignInAndUserSetup, login} from "../features/user/userSlice";

const Login = () => {
    const dispatch = useAppDispatch();

    // 無名関数を作成しそれをloginWithGoogleに渡す
    // phpでいう$loginWithGoogle = function () { ... };と同じ、引数を受け取らないため()
    const loginWithGoogle = () => {
        // async関数なので非同期の呼び出しが完了するまでthenで待機
        // thenは関数を引数に取る
        googleSignInAndUserSetup().then(
            // 「終わったら呼ばれる関数」をいったん変数に出した形は下記、これをそのまま渡している
            //   const onFinished = (userId) => {
            //       if (userId) {
            //           dispatch(login(userId));
            //       }
            //   };
            // userIdを関数の引数として持つ,stringかundefined型
            (userId) => {
                // userIdがあればlogin実行
                if(userId) {
                    dispatch(login(userId));
                }
            }
        )
    }

    return (
        <div className="fixed flex inset-0 items-center justify-center bg-gray-500">
            <div className="w-full max-w-xs">
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-8">
                        <h1 className="text-3xl text-center text-gray-700 mt-4">Slackにログイン</h1>
                    </div>
                    <div className="flex items-center justify-center">
                        <button
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            // ()なしで関数そのものを渡す、()をつけるとその場で実行される
                            onClick={loginWithGoogle}>
                            ログイン
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;