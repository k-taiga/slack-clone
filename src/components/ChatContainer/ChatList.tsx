import { useEffect, useState } from 'react';
import { subscribeChannels } from '../../features/channel/channelAPI';
import { ChannelRef } from '../../type/Channel';
import ChannelCell from './ChannelCell';
import ChannelAddModal from "./ChannelAddModal";

const ChatList = () => {
    // modal用の状態の変数
    const [showModal, setShowModal] = useState<boolean>(false);
    // 画面に出すチャンネル一覧。ただの変数ではなく state にするのは、
    // setChannelRefs で更新したとき React が画面を描き直してくれるのがこの形だけのため
    const [channelRefs, setChannelRefs] = useState<ChannelRef[]>([]);

    // 通信の開始のような「描画そのものではない処理」は useEffect の中でやる
    useEffect(() => {
        // 渡した関数はデータが届くたび呼ばれる。そのつど state を入れ替えて画面を更新する
        const unsubscribe = subscribeChannels((channelRefs) => {
            setChannelRefs(channelRefs);
        });
        // useEffect が返した関数は、この画面が消えるとき React が呼ぶ。
        // ここで監視を止めないと、もう無い画面に向けてデータが届き続ける
        return () => unsubscribe();
        // 第 2 引数の空配列は「最初の 1 回だけ実行する」の意味。
        // 付け忘れると描画のたびに監視が増えていく
    }, []);

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="w-64 bg-gray-800">
            <div className="px-4 py-3 mb-4 border-b border-gray-700">
                <span className="font-bold text-gray-300">チャンネル</span>
            </div>
            <div className="overflow-y-auto">
                {/* JSX の中には for 文を書けないので、map で配列を要素の配列に変換して並べる */}
                {channelRefs.map(({ channel, id }) => (
                    // key は React が「前回のどの要素と同じものか」を見分けるための印。
                    // 無いと追加・削除のときに中身がずれることがある
                    <ChannelCell channel={channel} id={id} key={id} />
                ))}
            </div>
            <div className="px-4 py-2">
                <button
                    className="text-gray-300 hover:text-white"
                    onClick={handleOpenModal}
                >
                    + チャンネルを追加する
                </button>
                {showModal && <ChannelAddModal handleCloseModal={handleCloseModal}/>}
            </div>
        </div>
    );
};

export default ChatList;
