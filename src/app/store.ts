import { configureStore } from "@reduxjs/toolkit";
// userSlice.ts の default export（= userSlice.reducer）。login / logout をまとめた 1 つの reducer。
import userReducer from "../features/user/userSlice";
import channelReducer from "../features/channel/channelSlice.ts";

// アプリ全体の state を 1 つのオブジェクトで保持する store。
// configureStore は Redux DevTools 連携やミドルウェアの定番設定込みで store を作る。
export const store = configureStore({
  // キー名が state のプロパティ名、値がその枠を担当する reducer になる。
  // ここでは state.user = { userId: "" } という形になる。
  //
  // このキー名 user と、userSlice.ts の name: "userId" は別物。
  // name は action type の接頭辞（"userId/login"）にだけ使われ、state のキーには影響しない。
  reducer: {
    user: userReducer,
    channel: channelReducer
  },
});

// store の実体から型を取り出す。state の形を手書きしないので、slice を足しても型がずれない。
export type AppDispatch = typeof store.dispatch;
// getState() の戻り値の型 = state 全体の型。ここでは { user: { userId: string } }。
export type RootState = ReturnType<typeof store.getState>;