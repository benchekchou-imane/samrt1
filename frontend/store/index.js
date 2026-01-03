import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import adminReducer from './adminSlice';
import recordingReducer from './recordingSlice';
import quizReducer from './quizSlice';
import summaryReducer from './summarySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    recording: recordingReducer,
    quiz: quizReducer,
    summary: summaryReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [], // Ajoutez des actions si nécessaire
      },
    }),
});

export default store;
