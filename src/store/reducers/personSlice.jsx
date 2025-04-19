import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  info: null,
};

export const personSlice = createSlice({
  name: "people",
  initialState,
  reducers: {
    loadPeople: (state, action) => {
      state.info = action.payload;
    },
    removePeople: (state) => {
      state.info = null;
    },
  },
});

export const { loadPeople, removePeople } = personSlice.actions;

export default personSlice.reducer;
