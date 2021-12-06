import React, { useState, useEffect } from "react";
import "./App.css";

import Dropdown from "./Dropdown";
import Listbox from "./Listbox";
import Detail from "./Detail";
import axios from "axios";

const App = () => {
  console.log("RENDERING APP.JS");

  const data = [
    { value: 1, name: "A" },
    { value: 2, name: "B" },
    { value: 3, name: "C" },
  ];

  const [token, setToken] = useState("");
  const [genres, setGenres] = useState({
    selectedGenre: "",
    genresFromApi: [],
  });
  const [playlist, setPlaylist] = useState({
    selectedPlaylist: "",
    playlistFromApi: [],
  });
  const [tracks, setTracks] = useState({
    selectedTrack: "",
    tracksFromApi: [],
  });
  const [trackDetail, setTrackDetail] = useState(null);

  useEffect(() => {
    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          btoa(
            process.env.REACT_APP_CLIENT_ID +
              ":" +
              process.env.REACT_APP_CLIENT_SECRET
          ),
      },
    })
      .then((response) => {
        if (response.status !== 200) {
          throw response.statusText;
        }
        return response.json();
      })
      .then((tokenResponse) => {
        console.log(tokenResponse.access_token);
        setToken(tokenResponse.access_token);

        fetch("https://api.spotify.com/v1/browse/categories?locale=sv_US", {
          method: "GET",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Bearer " + tokenResponse.access_token,
          },
        })
          .then((genreResponse) => {
            if (genreResponse.status !== 200) {
              throw genreResponse.statusText;
            }
            return genreResponse.json();
          })
          .then((genreResponse) => {
            setGenres({
              selectedGenre: genres.selectedGenre,
              genresFromApi: genreResponse.categories.items,
            });
          });
      });
  }, [genres.selectedGenre]);

  const genreChanged = (val) => {
    setGenres({ selectedGenre: val, genresFromApi: genres.genresFromApi });

    fetch(
      `https://api.spotify.com/v1/browse/categories/${val}/playlists?limit=10`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    )
      .then((response) => {
        if (response.status !== 200) {
          throw response.statusText;
        }
        return response.json();
      })
      .then((playlistResponse) => {
        console.log("RES", playlistResponse);
        setPlaylist({
          selectedPlaylist: playlist.selectedPlaylist,
          playlistFromApi: playlistResponse.playlists.items,
        });
      })
      .then(console.log("NEW PLAY", playlist));
  };

  const playlistChanged = (val) => {
    setPlaylist({
      selectedPlaylist: val,
      playlistFromApi: playlist.playlistFromApi,
    });
  };

  const buttonClicked = (e) => {
    e.preventDefault();

    fetch(
      `https://api.spotify.com/v1/playlists/${playlist.selectedPlaylist}/tracks?limit=10`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    )
      .then((response) => {
        if (response.status !== 200) {
          throw response.statusText;
        }
        return response.json();
      })
      .then((tracksResponse) => {
        setTracks({
          selectedTrack: tracks.selectedTrack,
          tracksFromApi: tracksResponse.items,
        });
      });
  };

  const listboxClicked = (val) => {
    const trackInfo = tracks.tracksFromApi.find((t) => t.track.id === val);

    setTrackDetail(trackInfo.track);
  };

  return (
    <div className="container">
      <form onSubmit={buttonClicked}>
        <Dropdown
          label="Genre:"
          options={genres.genresFromApi}
          selectedValue={genres.selectedGenre}
          changed={genreChanged}
        />
        <Dropdown
          label="Playlist:"
          options={playlist.playlistFromApi}
          selectedValue={playlist.selectedPlaylist}
          changed={playlistChanged}
        />
        <div className="col-sm-6 row form-group px-0">
          <button type="submit" className="btn btn-success col-sm-12">
            Search
          </button>
        </div>
        <div className="row">
          <Listbox items={tracks.tracksFromApi} clicked={listboxClicked} />
          {trackDetail && <Detail {...trackDetail} />}
        </div>
      </form>
    </div>
  );
};

export default App;
