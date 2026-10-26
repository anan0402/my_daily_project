import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import { environment } from "@/config/env";
import { injectStore } from "@/lib/api-client";
import { queryClient } from "@/lib/react-query";
import { injectSocketStore } from "@/lib/socket";
import { store } from "@/lib/store";

const persistor = persistStore(store);

//Inject store to api-client vì api-client không phải là component nên không thể sử dụng useSelector
injectStore(store);

//Inject store to socket để dispatch Redux actions
injectSocketStore(store);

function AppProvider({ children }) {
  return (
    <GoogleOAuthProvider clientId={environment.googleClientId}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default AppProvider;
