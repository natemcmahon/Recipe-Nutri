var ingredientArray = [];
var cleanedArray = [];

// base api for our MealDB to gather recipe
var recipeApi = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

// placeholder user entry for recipe, will eventually be replaced by user entry
var userEntryPlaceholder = 'pizza';

// concatenate MealDB API
var recipeTestApi = recipeApi  + userEntryPlaceholder;

// fdc api setup, we append ingredients from MealDB api below
var fdcNutritionApi = 'https://api.nal.usda.gov/fdc/v1/foods/search';
var fdcApiKey = 'HdbPDR894aXY2G8mKcBsM3yf6FkjCrWrR6zYgagg';
var ingredientPlaceholder;
var nutritionTestApi;

// first api which gathers recipe based on user entered meal
fetch(recipeTestApi, {
    mode: "cors",
})
.then(function (response) {
    return response.json();
})
.then(function (data) {
    console.log(data);
    console.log(data.meals[0]);
    var accessor = 'strIngredient';

    // Loop to set up an array of ingredients which we will pass one by one to our fdc nutrition API below
    for (var i = 1; i < 21; i++) {
        var storer = accessor + i;
        console.log(storer);
        var currentIngredient = data.meals[0][storer];

        ingredientArray.push(currentIngredient);
        
        // meant to trim the empty values and push to cleanedArray, not currently working
        if (ingredientArray[i]) {
            cleanedArray.push(ingredientArray[i]);
        }
    } 

    // printing empty array for some reason
    console.log(cleanedArray);

    // printing our full list of ingredients but has empty values which is wasteful
    console.log(ingredientArray);

    // Loop through values in ingredientArray, using each value one at a time as an argument in fdc nutrition api to retrieve 
    // food nutrients. Currently console logging the responses
    for (var i = 0; i < ingredientArray.length; i++) {
        currentIngredient = ingredientArray[i];
        nutritionTestApi = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key=' + fdcApiKey + '&query=' + currentIngredient;

        fetch(nutritionTestApi, {
            mode: "cors",
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
        })
    }
})