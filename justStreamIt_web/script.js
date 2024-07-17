

async function _categories_name(){

    try{

        let array = [];
        let next_page = '';
        let number_page = 2;

        for(let x = 0; x < 5; x++) {

            const request_genres = await fetch(`http://localhost:8000/api/v1/genres/` + next_page, {

                method: "Get",
                headers: { "Accept": "Application/json"}
            })

            if(!request_genres.ok) throw new Error(`Erreur de l'API`);

            const genres =  await request_genres.json();

            for(let y = 0; y < 5; y++) {

                array.push(genres.results[y].name);
            }

            if(genres.next == null) break;

            next_page = `?page=` + number_page;
            number_page += 1;
        }

        return array;

    }
    catch(errors){
        errors.length < 1 ? errors = `Erreur de chargement` : ``;
        console.error(errors)
    }
}

async function _category_api(count_files, category){
    /* Retourne les 6 meilleurs films, ou une catégorie choisie*/

    try{

        const request_page1 = await fetch(`http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page_size=` + count_files + category, {

            method: "Get",
            headers: { "Accept": "Application/json"}
        })

        if(!request_page1.ok) throw new Error(`Erreur de l'API`);

        const page1 =  await request_page1.json();

        let numberTurn = page1.results.length;

        if(typeof numberTurn !== `number` || numberTurn < 1)  throw new Error(`Erreur de l'API`);

        const videos = [];

        for(let x = 0; x < numberTurn; x++) {

            if(category.length < 1 && x == 0) continue;

            videos.push(page1.results[x]);
        }

        return videos;

    }
    catch(errors){

        errors.length < 1 ? errors = `Erreur de chargement` : ``;
        console.error(errors);
    }
}

async function _unity_api(unity_number){

    try{

        const request_unity = await fetch(`http://localhost:8000/api/v1/titles/` + unity_number, {

            method: "Get",
            headers: { "Accept": "Application/json"}
        })

        if(!request_unity.ok) throw new Error(`Erreur de l'API`);

        const unity =  await request_unity.json();

        return unity;

    }
    catch(errors){
        errors.length < 1 ? errors = `Erreur de chargement` : ``;
        console.error(errors)
    }
}

function _categories_random() {

    // Récuperer trois nom de catégories au hasard

    if(typeof localStorage !== undefined && `categories` in localStorage) {

        let categories = JSON.parse(localStorage[`categories`]);
        let keys = categories.length;

        let array_catg = [];

        while(keys > 0) {

            let name_catg = categories[Math.floor(Math.random() * (keys - 1) +1)];

            categories = categories.filter((categories) => categories !== name_catg);

            name_catg = name_catg;

            array_catg.push(name_catg);

            if(array_catg.length == 3) break;

            keys--;
        }

        if(array_catg.length == 3) {

            return array_catg;

        }
        else { return false; }

    }
    else { return false; }
}

async function _categories_featured() {

    let array = _categories_random();
    if(!array) return false;

    const catg_1 = await _category_api(`6`, `&genre=` + array[0]);

    const catg_2 = await _category_api(`6`, `&genre=` + array[1]);

    const catg_3 = await _category_api(`6`, `&genre=` + array[2]);

    _category_create(`content-category-1`, array[0], catg_1);
    _category_create(`content-category-2`, array[1], catg_2);
    _category_create(`content-category-3`, array[2], catg_3);
}

function _categories_SelectHtml_create() {

    if(typeof localStorage !== undefined && `categories` in localStorage) {

        let catg = JSON.parse(localStorage[`categories`]);
        let keys = catg.length;

        if(`content` in document.createElement(`template`)) {

            let container = document.querySelector(`#content-category-3`).children[0];
 
            let html = document.querySelector(`#tp-select`);
            let html_elements = document.importNode(html.content, true);

            let content = html_elements.querySelector(`#select-show`);
            let select = content.querySelector(`#select-options`);

            for(let x = 0; x < keys; x++) {

                let option = document.createElement(`button`);
                option.setAttribute(`type`, `button`);
                option.setAttribute(`class`, `unity-option`);
                option.setAttribute(`data-option`, catg[x]);
                option.innerHTML = catg[x];

                select.appendChild(option);

                if(x >= 25) break;
            }

            container.insertBefore(html_elements, container.firstChild);

        } 
        else {
            console.error(`Erreur création de la sélection`);
        }
    }
    else {
        console.error(`Erreur création de la sélection`);
    }
}

function _category_create(id_container, catg_name, values) {

    let count_video = Object.keys(values).length;

    if(`content` in document.createElement(`template`)) {

        let html = document.querySelector(`#tp-category`);
        let content = document.querySelector(`#${id_container}`);

        let catg_title = content.children[0];
        catg_title.querySelector(`h2`).innerHTML = catg_name;

        let container = content.children[1];

        for(let x = 0; x < count_video; x++) {

            let html_elements = document.importNode(html.content, true);

            let figure = html_elements.querySelector(`figure`);
            let img = figure.children[0];
            let figcaption = figure.children[1];
            let title = figcaption.children[0];

            let data_video = values[x];

            let link = data_video.url;
            link = link.substring(link.lastIndexOf('/') + 1);

            figure.setAttribute(`data-link`, link);
            img.src = data_video.image_url;
            title.textContent = data_video.title;

            container.appendChild(html_elements);

            if(x >= 5) break;
        }

        if(count_video < 5 && !content.children[2].classList.contains(`display-none`)) {

            content.children[2].classList.add(`display-none`);
        }
        else {
            content.children[2].classList.remove(`display-none`);
        }

    } 
    else {
        console.error(`Erreur création de la page`);
    }
}

function _modal_create(video) {

    if(`content` in document.createElement(`template`)) {

        let container = document.querySelector(`html`);

        let modal_tp = document.querySelector(`#tp-modal`);
        let modal_elements = document.importNode(modal_tp.content, true);

        let modal_page = modal_elements.childNodes[0];

        let modal = modal_elements.querySelector(`.modal`);

        let modal_head = modal.children[0];
        let modal_body = modal.children[1];

        let head_details = modal_head.children[0];
        let head_img = modal_head.children[1].children[0];

        let title = head_details.children[0];
        let detail_1 = head_details.children[1];
        let detail_2 = head_details.children[2];
        let detail_3 = head_details.children[3];
        let detail_4 = head_details.children[4].children[1];

        let descriptif = modal_body.children[0];
        let actors = modal_body.children[1];

        title.textContent = video.title;
        detail_1.textContent = `${video.genres} - ${video.year}`;
        detail_2.textContent = `PG-${video.votes} - ${video.duration} minutes ( ${video.countries} )`;
        detail_3.textContent =  `IMDB score : ${video.imdb_score}`;
        detail_4.textContent =  video.directors;
        detail_4.style.paddingLeft = `12px`;

        head_img.src = video.image_url;

        descriptif.textContent = video.long_description;
        actors.textContent = `Avec : ${video.actors}`;

        container.appendChild(modal_elements);

    } 
    else {
        console.error(`Erreur création Modal`);
    }
}

function _modal_show() {

    const videos_view = document.querySelectorAll(`.video-view, .best-details`);

    videos_view.forEach((video) => {

        video.addEventListener(`click`, (e) => {

            let video_id = video.getAttribute(`data-link`);

            const data_video = _unity_api(video_id)
            .then((new_video) => {

                if(document.getElementById(`modal`) === null) {
                    
                    const modal = _modal_create(new_video);
                }
            })
            .then(() => {

                let new_top = parseInt(window.scrollY);

                const body = document.querySelector(`body`);
                const page = document.querySelector(`#modal`);
                const selectOptions = document.getElementById(`select-options`); 

                body.style.overflow = `hidden`;
                page.style.top = `${new_top}px`;
                
                if (!selectOptions.classList.contains(`display-none`)) selectOptions.classList.add(`display-none`);

                // Déplacer l'affiche si mode mobile
                if(parseInt(window.innerWidth) < 427) {

                    let modal_body = document.querySelector(`.modal-body`);
                    let modal_figure = document.querySelector(`.modal-figure`);
                    modal_body.insertBefore(modal_figure, modal_body.children[1]);
                } 

                // Fermeture modal
                const modal_close = document.getElementById(`modal-close`);

                modal_close.addEventListener(`click`, function(e) {

                    page.remove();
                    body.style.overflow = `auto`;
                })
                
            })
            .catch((error) => console.warn(error))
        })
    })
}





document.addEventListener('DOMContentLoaded', function () {

    // _________________
    // Ouverture de page

    // tous les genres
    const name_categories = _categories_name()
    .then((catgs_name) => {
        console.log(catgs_name)
        localStorage.setItem(`categories`, JSON.stringify(catgs_name));
    })


    // Le meilleur des meilleurs
    const the_best = _unity_api(`?sort_by=-imdb_score`)
    .then((page) => {

        let url_unity = page.results[0].url;
        url_unity = url_unity.substring(url_unity.lastIndexOf('/') + 1);

        _unity_api(url_unity)
        .then((best) => {

            const score = document.createElement(`span`);
            score.style.color = `crimson`;
            score.style.paddingLeft = `10px`;
            score.innerHTML = best.imdb_score;

            document.querySelector('.best-title').innerHTML = best.title;
            document.querySelector('.best-year').innerHTML = `${best.genres} - ${best.year}`;
            document.querySelector('.best-score').appendChild(score);
            document.querySelector(`.best-img`).src = best.image_url;
            document.querySelector(`.best-text`).innerHTML = best.long_description;

            const best_details = document.querySelector(`.best-details`)
            best_details.setAttribute(`data-link`, url_unity);
        })
    })


    // Les 6 meilleurs qui suivent
    const six_best = _category_api(`7`, ``)
    .then((result) => {

        _category_create(`content-best-videos`, `Les 6 meilleurs qui suivent`, result);
    })


    // Les 3 catégories suivantes à l'ouverture de page (au hasard)
    const featured_view = _categories_featured()



    // _______________________
    // Evenement / inter-actif

    Promise.all([name_categories, the_best, six_best, featured_view])
    .then(() => {


        // Catégories liste
        const selectHtml = _categories_SelectHtml_create();

        const selectShow = document.getElementById(`select-show`); 

        const selectOptions = document.getElementById(`select-options`); 

        const optionsAll = document.querySelectorAll(`.unity-option`);

        const viewsAll = document.querySelectorAll(`.category-allview`);


        function unity_hide(parent, figure, view) {

            if(parent.contains(figure)) {

                let stat_element = getComputedStyle(figure)

                if(stat_element.display === `none`) {

                    figure.style.display = `block`;
                    view.innerHTML = `Fermer`;
                } 
                else {
                    figure.style.display = `none`;
                    view.innerHTML = `Ouvrir`;
                }
            }
        }

        // Catégories (Ouverture select)
        selectShow.addEventListener(`click`, () => {

            if(selectOptions.classList.contains(`display-none`)) {

                selectOptions.classList.remove(`display-none`);
            } 
            else {
                selectOptions.classList.add(`display-none`);
            }
        });


        // Catégories (choix)
        optionsAll.forEach((category) => {

            category.addEventListener(`click`, (e) => {

                let category_name = category.getAttribute(`data-option`);

                _category_api(`6`, `&genre=` + category_name)
                .then((result) => {

                    const container = document.getElementById(`category-3`); 

                    while (container.firstChild) {
                        
                        container.removeChild(container.firstChild);
                    }

                    return result;
                    
                })
                .then((result) => {

                    _category_create(`content-category-3`, category_name, result);

                    selectOptions.classList.add(`display-none`);

                })
                .then(() => {
                    _modal_show();

                })
                .catch((error) => console.warn(error))
            })
        })


        // Catégories (Ouverture modal)
        _modal_show();


        // Catégories (Vue des films cachés)
        viewsAll.forEach((view) => {

            view.addEventListener(`click`, (e) => {

                return new Promise((resolve, reject) => {

                    let div = view.parentNode;
                    let parent = div.parentNode;

                    let videos = parent.querySelector(`.category-body`);

                    if(videos.children.length > 2) {

                        let figure_3 = videos.children[2];
                        let figure_4 = videos.children[3];

                        unity_hide(parent, figure_3, view);
                        unity_hide(parent, figure_4, view);
                    }

                    if(videos.children.length > 4) {

                        let figure_5 = videos.children[4];
                        let figure_6 = videos.children[5];

                        unity_hide(parent, figure_5, view);
                        unity_hide(parent, figure_6, view);
                    }

                }) 
                .catch((error) => console.warn(error))

            })
        })

    })
    .catch((error) => console.warn(error))

}, false);

