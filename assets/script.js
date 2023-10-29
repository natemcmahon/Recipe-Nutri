// array to store strings, ingredients
var ingredientArray = [];

// base api for our MealDB to gather a recipe
var recipeBaseApi = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

// placeholder user entry for a recipe, will eventually be replaced by user entry
var userEntryPlaceholder = 'pizza';

// concatenate MealDB API
var recipeTestApi = recipeBaseApi + userEntryPlaceholder;

// fdc api setup, we append ingredients from MealDB api below
var fdcNutritionBaseApi = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key=';
var fdcApiKey = 'HdbPDR894aXY2G8mKcBsM3yf6FkjCrWrR6zYgagg';

var protein_meal_sum = 0.0;
var fat_meal_sum = 0.0;
var carbs_meal_sum = 0.0;
var kcal_meal_sum = 0.0;
var sugar_meal_sum = 0.0;
var sodium_meal_sum = 0.0;


// async function to fetch recipe data
async function fetchRecipeData() {
    try {
        const response = await fetch(recipeTestApi, {
            mode: "cors",
        });

        if (response.ok) {
            const data = await response.json();
            // console.log(data);
            // console.log(data.meals[0]);
            var accessor = 'strIngredient';

            // Loop to set up an array of ingredients which we will pass one by one to our fdc nutrition API below
            for (var i = 1; i < 21; i++) {
                var storer = accessor + i;
                // console.log(storer);
                var currentIngredient = data.meals[0][storer];

                if (currentIngredient !== "") {
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

async function fetchNutritionData(ingedient) {
    try {
        ing_nutr_api = fdcNutritionBaseApi + fdcApiKey + '&query=' + ingedient;
        // console.log(ing_nutr_api)
        const response = await fetch(ing_nutr_api, {
            mode: "cors",
        });

        if (response.ok) {
            const data = await response.json();

            console.log("food is : ", data.foods[0]);

            my_nutrients = data.foods[0]["foodNutrients"];

            const findNutrientValue = (nutrientName) => {
                const nutrient = my_nutrients.find(nutrient => nutrient.nutrientName === nutrientName);
                return nutrient ? parseFloat(nutrient.value) : null;
            };

            let protein_grams = findNutrientValue('Protien');
            let fat_grams = findNutrientValue('Total lipid (fat)');
            let carbs_grams = findNutrientValue('Carbohydrate, by difference');
            let kilo_calories = findNutrientValue('Energy');
            let sugars = findNutrientValue('Sugars, total including NLEA');
            let sodium = findNutrientValue('Sodium, Na');

            protein_meal_sum += protein_grams;
            fat_meal_sum += fat_grams;
            carbs_meal_sum += carbs_grams;
            kcal_meal_sum += kilo_calories;
            sugar_meal_sum += sugars;
            sodium_meal_sum += sodium;

            // console.log(my_nutrients);

        } else {
            console.log('Error fetching nutrition data:', response.status, response.statusText);
        }
    } catch(error) {
        console.error('Error fetching nutrition data:', error);
    }
}

async function main() {
    // Call fetchRecipeData with await to ensure it completes before moving on
    await fetchRecipeData();

    // Loop through each ingredient, one fetch per
    for (i = 0; i < ingredientArray.length; i++) {
        await fetchNutritionData(ingredientArray[i]);
    }

    console.log("Protien in meal: ", protein_meal_sum);
    console.log("Fat in meal: ", fat_meal_sum);
    console.log("Carbs in meal: ", carbs_meal_sum);
    console.log("Energy in meal: ", kcal_meal_sum);
    console.log("Sugar in meal: ", sugar_meal_sum);
    console.log("Salt in meal: ", sodium_meal_sum);

}

main(); // Call the main function to start the process
