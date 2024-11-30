const form = document.querySelector('form')
const input = document.querySelector('#search')
const select = document.querySelector('#select')
const output = document.querySelector('#output')
const random = document.querySelector('#random')
const typesGlasses = document.querySelector('#types_glasses')
const home = document.querySelector('#home')

const API = 'https://www.thecocktaildb.com/api/json/v1/1/'
const GET_ALL_COCKTAILS = API + 'filter.php?c=Cocktail'
const GET_BY_NAME = API + 'search.php?s='
const getByFilter = API + 'filter.php?a='
const getById = API + 'lookup.php?i='
const randomCocktail = API + 'random.php'
const filterByGlass = API + 'filter.php?g='

home.addEventListener('click', () => location.reload())

const fetchAllCocktails = async () => {
	const req = await fetch(GET_ALL_COCKTAILS)
	const res = await req.json()
	renderCocktails(res.drinks)
}

const fetchByFilter = async () => {
	// console.log(select.value)

	if (select.value === 'All') {
		return fetchAllCocktails()
	}
	const req = await fetch(getByFilter + select.value)
	const res = await req.json()
	renderCocktails(res.drinks)
}

const fetchCocktailsByName = async e => {
	e.preventDefault()
	if (!input.value.trim().length) return
	const req = await fetch(GET_BY_NAME + input.value)
	const res = await req.json()
	renderCocktails(res.drinks)
}

// Чтобы пользователь не ебал кнопки

let isLoading = false
const fetchCocktailDetail = async id => {
	if (isLoading) return
	isLoading = true

	try {
		const req = await fetch(getById + id)
		const res = await req.json()
		renderDetailCocktail(res.drinks[0])
	} catch (error) {
		console.error('Ошибка загрузки деталей коктейля:', error)
		output.innerHTML =
			'<h1>Не удалось загрузить детали коктейля. Попробуйте позже.</h1>'
	} finally {
		isLoading = false
	}
}

const fetchRandomCocktail = async () => {
	const req = await fetch(randomCocktail)
	const res = await req.json()
	renderCocktails(res.drinks)
}

const fetchAboutIngredient = async ingredient => {
	const req = await fetch(API + 'search.php?i=' + ingredient)
	const res = await req.json()
	renderIngredients(res.ingredients[0])
}

const fetchFilterGlasses = async () => {
	let req
	if (typesGlasses.value === 'All') {
		req = await fetch(GET_ALL_COCKTAILS)
	} else {
		req = await fetch(filterByGlass + typesGlasses.value)
	}

	const res = await req.json()
	renderCocktails(res.drinks)
}

const renderIngredients = ingredient => {
	if (!ingredient) {
		output.innerHTML = '<h1>Информация об ингредиенте не найдена</h1>'
		return
	}

	output.innerHTML = ''
	const wrapper = document.createElement('div')

	const name = document.createElement('h1')
	name.textContent = ingredient.strIngredient

	const description = document.createElement('p')
	description.textContent = ingredient.strDescription || 'Описание отсутствует'

	wrapper.append(name, description)
	output.append(wrapper)
}

// output.removeEventListener('click', handleOutputClick) // Очистка старых обработчиков
// output.addEventListener('click', handleOutputClick)

// function handleOutputClick(event) {
// 	const target = event.target

// 	if (target.tagName === 'BUTTON' && target.textContent === 'Подробнее') {
// 		const id = target.closest('.card').dataset.idDrink
// 		fetchCocktailDetail(id)
// 	}
// }

const renderCocktails = data => {
	// console.log(data)
	if (!data || data.length === 0) {
		output.innerHTML = `<h1>Коктейли не найдены!</h1>`
		return
	} else {
		output.innerHTML = ''
		data && data.length > 0
			? data.map(item => {
					const card = document.createElement('div')
					card.classList.add('card')
					card.dataset.idDrink = item.idDrink // Привязываем ID
					const image = document.createElement('img')
					image.src = item.strDrinkThumb
					image.alt = `Фото коктейля ${item.strDrink}`
					const title = document.createElement('h2')
					title.textContent =
						item.strDrink.length > 15
							? item.strDrink.slice(0, 15) + '...'
							: item.strDrink
					title.title = item.strDrink

					const infoBtn = document.createElement('button')
					infoBtn.textContent = 'Подробнее'

					infoBtn.addEventListener('click', () => {
						fetchCocktailDetail(item.idDrink)
					})

					card.append(image, title, infoBtn)
					output.append(card)
			  })
			: (output.innerHTML = `<h1>Коктейли не найдены!</h1>`)
	}
}

const renderDetailCocktail = cocktail => {
	console.log(cocktail)
	output.innerHTML = ''
	const wrapper = document.createElement('div')
	const image = document.createElement('img')
	image.src = cocktail.strDrinkThumb
	image.alt = `Фото коктейля ${cocktail.strDrink}`
	const title = document.createElement('h1')
	title.textContent =
		cocktail.strDrink.length > 15
			? cocktail.strDrink.slice(0, 15) + '...'
			: cocktail.strDrink
	title.title = cocktail.strDrink

	const isAlcohol = document.createElement('h3')
	isAlcohol.textContent = cocktail.strAlcoholic

	const ol = document.createElement('ol')

	const typeOfGlass = document.createElement('h4')
	typeOfGlass.textContent = `Type of glass: ${cocktail.strGlass}`

	for (let key in cocktail) {
		// console.log(key)
		// console.log(cocktail[key])
		if (key.includes('strIngredient') && cocktail[key]) {
			const li = document.createElement('li')
			li.textContent = cocktail[key]

			const infoButton = document.createElement('button')
			infoButton.textContent = 'Подробнее об ингредиенте'
			infoButton.addEventListener('click', () => {
				fetchAboutIngredient(cocktail[key])
			})

			li.textContent = cocktail[key]
			li.append(infoButton)
			ol.append(li)
		}
	}

	wrapper.append(image, title, isAlcohol, ol, typeOfGlass)
	output.append(wrapper)
}

form.addEventListener('submit', fetchCocktailsByName)
random.addEventListener('click', fetchRandomCocktail)
select.addEventListener('change', fetchByFilter)
typesGlasses.addEventListener('change', fetchFilterGlasses)

fetchAllCocktails()
