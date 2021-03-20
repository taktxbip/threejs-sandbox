"use strict";

import "./scss/main.scss";
import "./images/bg.jpg";
import "./images/content_1.jpg";
import "./images/content_2.jpg";
import "./images/content_3.png";
import "./images/Logotype.svg";
import "./images/search.svg";
import "./images/Star.svg";
import "./images/trash.png";
import "./images/mars.webp";

// const personalMovieDB = {
//     count: 0,
//     movies: {},
//     actors: {},
//     genres: [],
//     privat: false,
//     start: function () {
//         while (!personalMovieDB.count || personalMovieDB.count.length > 50 || personalMovieDB.count == null || isNaN(personalMovieDB.count)) {
//             personalMovieDB.count = +prompt('How many films have you watched?');
//         }
//     },
//     rememberMyFilms: function () {
//         for (let i = 0; i < 2; i++) {
//             const film = prompt('What was one of the last films you watched?'),
//                 rate = prompt('How do you like it (10 is max)?');

//             personalMovieDB.movies[film] = rate;
//         }
//     },
//     detectPesonalLevel: function () {
//         if (personalMovieDB.count < 10) {
//             console.log('Not enough films watched');
//         } else if (personalMovieDB.count <= 30) {
//             console.log('You\'re classical watcher');
//         } else if (personalMovieDB.count > 30) {
//             console.log('You\'re films addicted!');
//         } else {
//             console.log('Error in our galaxy');
//         }
//     },
//     showMyDB: function () {
//         if (!personalMovieDB.privat) console.log('DB:', personalMovieDB);
//     },
//     toggleVisibleMyDB: function () {
//         personalMovieDB.privat ? personalMovieDB.privat = false : personalMovieDB.privat = true;
//     },
//     writeYourGenres: function () {
//         for (let i = 0; i < 3; i++) {
//             const fav = prompt(`Your favourite genre #${i + 1}`);
//             if (fav) personalMovieDB.genres.push(fav);
//         }
//     }
// };

// document.querySelector('.promo__adv').remove();
// const genre = document.querySelector('.promo__genre');
// genre.innerText = 'Драма';

// const promoBg = document.querySelector('.promo__bg'),
//     items = document.querySelectorAll('.promo__interactive-item');

// console.dir(items);

// promoBg.style.backgroundImage = 'url("/images/bg.jpg")';

// items.forEach(items => {
//     items.innerHTML = '';
// });

// for (let i = 0; i < movieDB.movies.length; i++) {
//     items[i].innerText = `${i + 1}. ${movieDB.movies[i]}`;
//     const del = document.createElement('div');
//     del.classList.add('delete');
//     items[i].append(del);
// }

// const film = document.querySelector('.promo__menu-item');
// film.onclick = function() {
//     alert('film');
// };

// film.addEventListener('click', function () {
//     alert('film2');
// });

// film.addEventListener('mouseenter', function (e) {
//     console.log(e);
// });

class MovieDB {
    constructor() {
        this.movies = [
            "Скотт Пилигрим против...",
            "Логан",
            "Лига справедливости",
            "Ла-ла лэнд",
            "Одержимость",
        ];
    }

    displayMovies() {
        const filmsList = document.querySelector(".promo__interactive-list");

        filmsList.innerHTML = "";
        this.movies.forEach((movie, index) => {
            filmsList.innerHTML += `<li class="promo__interactive-item">${
                index + 1
                }. ${movie}<div class="delete"></div></li>`;
        });
    }

    addMovie(movie) {
        movie = movie.length > 21 ? `${movie.slice(0, 21)}...` : movie;
        this.movies.push(movie);
        this.movies.sort();
        this.displayMovies();
    }

    initDeleteMovies() {
        const actionDelete = document.querySelectorAll(".delete");
        // Init action delete
        actionDelete.forEach((element, i) => {
            element.addEventListener('click', function (e) {
                this.deleteMovie(i);
            });
        });
    }

    deleteMovie(i) {
        this.movies.splice(i, 1);
        this.displayMovies();
    }
}


const movies = new MovieDB();
movies.initDeleteMovies();

document.addEventListener('DOMContentLoaded', function () {

    movies.displayMovies();
    movies.addMovie("А пример");

    const addForm = document.querySelector(".add");

    addForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const inputFilm = document.querySelector(".add .adding__input").value,
            checkbox = document.querySelector('.add input[type="checkbox"]').checked;
        if (checkbox) {
            console.log("Adding favourite film");
        }
        movies.addMovie(inputFilm);
    });


});

