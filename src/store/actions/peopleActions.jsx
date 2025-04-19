export { removePeople } from "../reducers/personSlice";
import axios from "../../utils/axios";
import { loadPeople } from "../reducers/personSlice";

export const asyncLoadPeople = (id) => async (dispatch, state) => {
  try {
    const detail = await axios.get(`/person/${id}`);
    const externalId = await axios.get(`/person/${id}/external_ids`);
    const changes = await axios.get(`/person/${id}/changes`);
    const combinedCredits = await axios.get(`/person/${id}/combined_credits`);
    const images = await axios.get(`/person/${id}/images`);
    let theUltimateDetails = {
      details: detail.data,
      externalId: externalId.data,
      changes: changes.data,
      combinedCredits: combinedCredits.data,
      images: images.data,
    };
    dispatch(loadPeople(theUltimateDetails));
    console.log(theUltimateDetails);
  } catch (error) {
    console.log(error);
  }
};
