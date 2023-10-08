let autocompleteData = null;

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

async function getResult(input){
    const searchText = `https://api.github.com/search/repositories?q=${input}&per_page=5`;
    try {
        const response = await fetch(searchText, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        const data = await response.json();
        autocompleteData = data.items;
        return data;
    } catch (error) {
        console.error(error);
    }
}

function showResult(item){
    const result = document.querySelector('.repo-list')
    result.insertAdjacentHTML('beforeend', `
            <div class="repo-item">
                <div class="repo-info">
                    <p><strong>Name:</strong> ${item.name}</p>
                    <p><strong>Owner:</strong> ${item.owner.login}</p>
                    <p><strong>Stars:</strong> ${item.stargazers_count}</p>
                </div>
                <div class="delete-btn"><img src="x-symbol-svgrepo-com.svg" alt="Закрыть""></div>
            </div>
        `)
}

function autocompleteResult(data){
    const result = document.querySelector('.autocomplete-items')
    result.innerHTML = data.items.map(item => {
        return `
            <p>${item.name}</p>
        `
    }).join('')
}

const debouncedSearch = debounce(async (input) => {
    const data = await getResult(input);
    autocompleteResult(data);
}, 300);

document.querySelector('.search-bar').addEventListener('keyup', function (e) {
    const input = e.target.value;
    if(input.trim() !== '') {
        debouncedSearch(input);
    }
});

document.querySelector('.autocomplete-items').addEventListener('click', function(e){
    const item = e.target
    const repoData = autocompleteData.find(repo => repo.name === item.textContent);
    if (repoData) {
        showResult(repoData);
        document.querySelector('.autocomplete-items').innerHTML = ''
    }
})

document.querySelector('.repo-list').addEventListener('click', function(e){
    if(e.target.classList.contains('delete-btn') || e.target.tagName === 'IMG'){
        e.target.closest('.repo-item').remove()
    }
})

