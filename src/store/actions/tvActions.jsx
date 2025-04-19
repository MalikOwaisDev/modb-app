export { removeTv } from "../reducers/tvSlice";
import axios from "../../utils/axios";
import { loadTv } from "../reducers/tvSlice";

export const asyncLoadTv = (id) => async (dispatch, state) => {
  try {
    const detail = await axios.get(`/tv/${id}`);
    const externalId = await axios.get(`/tv/${id}/external_ids`);
    const recommendations = await axios.get(`/tv/${id}/recommendations`);
    const similar = await axios.get(`/tv/${id}/similar`);
    const translations = await axios.get(`/tv/${id}/translations`);
    const videos = await axios.get(`/tv/${id}/videos`);
    const credits = await axios.get(`/tv/${id}/aggregate_credits`);
    const watchProviders = await axios.get(`/tv/${id}/watch/providers`);
    let theUltimateDetails = {
      details: detail.data,
      externalId: externalId.data,
      recommendations: recommendations.data.results,
      similar: similar.data.results,
      credits: {
        cast: credits.data.cast,
        crew: credits.data.crew,
      },
      translations: translations.data.translations.map(
        (t, i) => t.english_name
      ),
      videost: videos.data.results.find((m) => m.type === "Trailer"),
      videos: videos.data.results,
      watchProviders:
        watchProviders.data && watchProviders.data
          ? watchProviders.data.results.US
          : [],
    };
    dispatch(loadTv(theUltimateDetails));
  } catch (error) {
    console.log(error);
  }
};
