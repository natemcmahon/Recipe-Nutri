var calorieElement = document.querySelector('.energyCal');
var proteinElement = document.querySelector('.protein');
var fatElement = document.querySelector('.fat');
var carbsElement = document.querySelector('.carbs');
var sugarElement = document.querySelector('.sugar');
var saltElement = document.querySelector('.salt');
var instructionsElement = document.querySelector('.instructions');
var ingredientsElement = document.querySelector('.ingredientList');

var protein_meal_sum = 0.0;
var fat_meal_sum = 0.0;
var carbs_meal_sum = 0.0;
var kcal_meal_sum = 0.0;
var sugar_meal_sum = 0.0;
var sodium_meal_sum = 0.0;

// array to store strings, ingredients
var ingredientArray = [];

// base api for our MealDB to gather a recipe
var recipeBaseApi = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

var formData = null;
var recipeTestApi = ""; // CORS discrpency, doesn't work; null also doesn't work

document.addEventListener('DOMContentLoaded', function () {
    const formEl = document.getElementById('recipeForm');


    formEl.addEventListener('submit', async (event) => {
        event.preventDefault();

        var mealInput = document.querySelector('#mealInput').value;
        console.log(mealInput);

        //clear ingredientArray each submit to prevent nutrition values
        //accumulating search totals
        ingredientArray = [];

        await fetchRecipeData(mealInput);

        protein_meal_sum = 0.0;
        fat_meal_sum = 0.0;
        carbs_meal_sum = 0.0;
        kcal_meal_sum = 0.0;
        sugar_meal_sum = 0.0;
        sodium_meal_sum = 0.0;

        // Loop through each ingredient, one fetch per
        for (i = 0; i < ingredientArray.length; i++) {
            await fetchNutritionData(ingredientArray[i]);
        }

        displayNutritionFacts();
    });
});

//concatenate MealDB API
var recipeTestApi = recipeBaseApi + formData;
console.log(recipeTestApi);

// fdc api setup, we append ingredients from MealDB api below
var fdcNutritionBaseApi = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key=';
var fdcApiKey = 'HdbPDR894aXY2G8mKcBsM3yf6FkjCrWrR6zYgagg';


// async function to fetch recipe data
async function fetchRecipeData(recipeName) {
    try {
        const response = await fetch(recipeBaseApi + recipeName, {
            mode: "cors",
        });
            // console.log(response);
        if (response.ok) {
            const data = await response.json();
            // console.log(data);
            // console.log(data.meals[0]);
            var accessor = 'strIngredient';
            var measurementAccessor = 'strMeasure';

            // nate test
            // console.log(data.meals[0].strInstructions);
            instructionsElement.textContent = data.meals[0].strInstructions;

            // Loop to set up an array of ingredients which we will pass one by one to our fdc nutrition API below
            for (var i = 1; i < 21; i++) {
                var storer = accessor + i;
                var measurementStorer = measurementAccessor + i;

                var currentIngredient = data.meals[0][storer];
                var currentMeasurement = data.meals[0][measurementStorer];

                // append list of ingredients to ul ingredientList ul
                var li = document.createElement("li");
                ingredientsElement.appendChild(li);
                // console.log(currentMeasurement);
                li.textContent =  currentMeasurement + " " + currentIngredient;

                if (currentIngredient !== null) {
                    currentIngredient = currentIngredient.trim();
                    ingredientArray.push(currentIngredient);
                }
            }
        } else {
            console.log('Error recipe fetching data:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error fetching recipe data:', error);
    }
}

async function fetchNutritionData(ingredient) {
    try {
        ing_nutr_api = fdcNutritionBaseApi + fdcApiKey + '&query=' + ingredient;
        // console.log(ing_nutr_api)
        const response = await fetch(ing_nutr_api, {
            mode: "cors",
        });

        if (response.ok) {
            const data = await response.json();

            console.log("food is : ", data.foods[0]);

            my_nutrients = data.foods[0]["foodNutrients"];

            const findNutrientValue = (nutrientId) => {
                const nutrient = my_nutrients.find(nutrient => nutrient.nutrientId === nutrientId);
                return nutrient ? parseFloat(nutrient.value) : null;

            };

            //removes salt ingredient from calculation (-39k mg)
            // ^ not correct to actual recipe but looks waay better
            if (data.foods[0].fdcId !== 2120877) {
                //get the numbers for each nutrient
                let protein_grams = findNutrientValue(1003);
                //console.log('Protein value:', protein_grams); // working w/ nutrientId!
                let fat_grams = findNutrientValue(1004);
                let carbs_grams = findNutrientValue(1005);
                let kilo_calories = findNutrientValue(1008);
                //console.log('Energy value:', kilo_calories);
                let sugars = findNutrientValue(2000);
                let sodium = findNutrientValue(1093);

                //add up for total of each nutrient from all the ingredients
                protein_meal_sum += protein_grams;
                fat_meal_sum += fat_grams;
                carbs_meal_sum += carbs_grams;
                kcal_meal_sum += kilo_calories;
                sugar_meal_sum += sugars;
                sodium_meal_sum += sodium;

            } else {
                console.log('Error fetching nutrition data:', response.status, response.statusText);
            }
        }
    } catch (error) {
        console.error('Error fetching nutrition data:', error);
    }
}

function displayNutritionFacts() {
    calorieElement.textContent = "Calories  " + Math.round(kcal_meal_sum);
    proteinElement.textContent = "Protein  " + Math.round(protein_meal_sum) + "g";
    fatElement.textContent = "Total Fat  " + Math.round(fat_meal_sum) + "g";
    carbsElement.textContent = "Total Carbohydrate  " + Math.round(carbs_meal_sum) + "g";
    sugarElement.textContent = "Sugars  " + Math.round(sugar_meal_sum) + "g";
    saltElement.textContent = "Sodium  " + Math.round(sodium_meal_sum) + "mg";

}

async function main() {
    // Call fetchRecipeData with await to ensure it completes before moving on
    await fetchRecipeData();

    // Loop through each ingredient, one fetch per
    for (i = 0; i < ingredientArray.length; i++) {
        await fetchNutritionData(ingredientArray[i]);
    }

    displayNutritionFacts();
}
