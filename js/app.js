// Initialise required variables
var row = 5;
var column = 5;
var matrix = create2dArray(row,column); // Number
var traversedMatrix = create2dArray(row,column,false); // boolean
var ranCount = 0;

// Initialise colour variables
var sourceColor = "red";
var destinationColor = "green";
var wallColour = "black";
var nonWallColour = "transparent";
var traversedColor = "blue";
var gridColour = "blueviolet";

// Animation Oriented variables
var traversedPaths = [];
var transitionDuration = 1.5; // Seconds
var cellToCellDelay = 200; // milliseconds

// Javascript functions
function setGridColours() 
{
    for(var i = 0; i < row; i++)
    {
        for(var j = 0; j < column; j++)
        {
            $("#" + i + "_" + j).css("background-color",nonWallColour);
        }
    }

    // Set Source colour
    $("#0_0").css("background-color",sourceColor);

    // Set Destination colour
    $("#" + (row - 1) + "_" + (column - 1)).css("background-color",destinationColor);
}

function drawGrid() 
{
    // Clear all the child elements before draw operation
    $(".grid").empty();

    var gridContent = "";

    for(var i = 0; i < row; i++)
    {
        gridContent += "<div class=\"grid-row\">";

        for(var j = 0; j < column; j++)
        {
            var id = i + "_" + j;
            gridContent += "<div class=\"grid-column\" id=" + "\"" + id + "\"" + " onmouseover=" + "\"setCellType(" + '\'' + id + '\'' + ")\"" + ">";
            gridContent += "</div>";
        }
        
        gridContent += "</div>";
    }

    // Add all the cell blocks to UI grid
    $(".grid").append(gridContent);
}

function create2dArray(n = 1,m = 1,defaultValue = 0) 
{
    // Initialise 1st dimension
    var matrix = new Array(n);

    // Initialise 2nd dimension
    for (var i = 0; i < n; i++)
    {
        matrix[i] = new Array(m);
    }

    // 1 => Block (or) wall
    // 0 => Travesable path

    // Set values to 
    for (var i = 0; i < n; i++)
    {
        for (var j = 0; j < m; j++)
        {
            // Initially set all cells as traversable one
            matrix[i][j] = defaultValue;
        }
    }

    return matrix;
}

// Set cell type like Block(1) or traversable path(0)
function setCellType(posId) 
{
    // Not an alteration in matrix
    if (!window.event.altKey) 
    {
        var splitted = (posId != null) ? posId.split("_") : null ;

        if (splitted != null && splitted.length == 2) 
        {
            // If Position is not both the source and destination then update the data and UI element
            if (posId != "0_0" && splitted[0] + "_" + splitted[1] != (row - 1) + "_" + (column - 1)) 
            {
                // If ctrl key is pressed then make it Block (1)
                if (window.event.ctrlKey) 
                {
                    if (splitted != null) 
                    {
                        // Make matrix cell as block for backend logic
                        matrix[parseInt(splitted[0])][parseInt(splitted[1])] = 1;

                        // Update UI with appropriate colour as per configuration setting
                        setCellColour(posId,wallColour);
                    }
                } 
                else
                {
                    // Make matrix cell as block for backend logic
                    matrix[parseInt(splitted[0])][parseInt(splitted[1])] = 0;

                    // Update UI with appropriate colour as per configuration setting
                    setCellColour(posId,nonWallColour);
                }
            }
        }
    } 
}

function setCellColour(cellId,colour = nonWallColour)
{
    if (cellId != null) 
    {
        $("#" + cellId).css("background-color",colour);
    }    
}

function setTraverseCellAnimation(cellId,duration = transitionDuration) 
{
    if (cellId != null) 
    {
        $("#" + cellId).css("transition","background-color " + duration + "s" + " ease");
    }
}

function drawTraversedPaths(isEraseOperation = false,traverseColor = traversedColor,duration = transitionDuration,redrawGrid = false) 
{
    if (traversedPaths != null)
    {
        var index = 0;

        // Draw animated path flow in forward direction
        if (!isEraseOperation) 
        {
            var handler = setInterval(function() 
            { 
                if (index >= traversedPaths.length) 
                {
                    clearInterval(handler);
                    console.log("forward Clear interval");
                    return;
                }

                setInterval(setCellColour(traversedPaths[index],traverseColor),cellToCellDelay);
                setInterval(setTraverseCellAnimation(traversedPaths[index],duration),cellToCellDelay);
                
                index++;
                
                console.log("forward set Interval");

            } , cellToCellDelay);
        }
        else
        {
            index = traversedPaths.length - 1;

            // Draw animated path flow in reverse direction
            var handler1 = setInterval(function() 
            { 
                if (index < 0)
                {
                    if (redrawGrid) 
                    {
                        // Redraw the grid
                        drawGrid();
                        // Set Initial Colors
                        setGridColours();
                        // Clear traversedPath array 
                        clearTraversedPath();
                    }

                    clearInterval(handler1);
                    console.log("reverse Clear interval");
                    return;
                }
                else
                {
                    setInterval(setCellColour(traversedPaths[index],traverseColor),cellToCellDelay);
                    setInterval(setTraverseCellAnimation(traversedPaths[index],duration),cellToCellDelay);
                    
                    index--;

                    console.log("reverse set Interval");
                }
            } , cellToCellDelay);
        }
    }    
}

function clearTraversedPath() 
{
    // Remove all old references for traversed paths
    // https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
    traversedPaths.length = 0;    
}

// Js eventlistener function block

document.addEventListener("DOMContentLoaded", function()
{
    // RowCount input change
    document.getElementById("rowCount").addEventListener('input', function()
    {
        var parsed = parseInt($("#rowCount").val());
        row = (parsed > 0) ? parsed : row;
        matrix = create2dArray(row,column);
        traversedMatrix = create2dArray(row,column,false);
        drawGrid();
        setGridColours();
    });

    // ColumnCount input change
    document.getElementById("columnCount").addEventListener('input', function()
    {
        var parsed = $("#columnCount").val();
        column = (parsed > 0) ? parsed : column;
        matrix = create2dArray(row,column);
        traversedMatrix = create2dArray(row,column,false);
        drawGrid();
        setGridColours();
    });

    // FindPath button clicked
    document.getElementById("findPath").addEventListener('click', function()
    {
        // If Start button clicked multiple times
        traversedMatrix = (ranCount++ > 0) ? create2dArray(row,column) : traversedMatrix;

        var isPathFound = findPath(row,column,matrix,traversedMatrix,0,0);

        console.log("Is Pathfound : " + isPathFound);

        if (isPathFound) 
        {
            // Animate traversed Paths
            // drawTraversedPaths();
            drawTraversedPaths(false,traversedColor,transitionDuration,false);
        }
        else
        {
            alert("No Path found");
        }

        // Re-Assign traversed matrix for re-using the same path configuration 
        traversedMatrix = create2dArray(row,column,false);
    });

    // Clear button clicked
    document.getElementById("clear").addEventListener('click', function()
    {
        // Reset all the traversed path colour
        drawTraversedPaths(true,"transparent",1,true);

        // Reset the matrix (only realted to code level)
        matrix = create2dArray(row,column,0);

        // Manually clear all traversedPath (only realted to code level)
        // clearTraversedPath();

        ranCount = 0;
    });
});

// Jquery functions


// -------------------------------> Path Finding Logic --------------------------------------->

function findPath(n,m,pathMatrix,backtrackMatrix,currentN,currentM) 
{
    if ((currentN >= 0 && currentM >= 0) && (currentN < n && currentM < m)) 
    {
        // Current cell should not be traversed and also be a trversable path (0)
        if (!backtrackMatrix[currentN][currentM] && pathMatrix[currentN][currentM] == 0) 
        {
            if (currentN == n - 1 && currentM == m - 1) 
            {
                // Destination found
                return true;
            }

            backtrackMatrix[currentN][currentM] = true;

            if (!(currentN == 0 && currentM == 0)) 
            {
                // Add all the traversed path into an new array for Backtracking(For UI) purpose
                traversedPaths.push(currentN + "_" + currentM);
            }

            return findPath(n,m,pathMatrix,backtrackMatrix,currentN - 1,currentM) // UP
            ||
            findPath(n,m,pathMatrix,backtrackMatrix,currentN,currentM + 1) // Right
            ||
            findPath(n,m,pathMatrix,backtrackMatrix,currentN + 1,currentM) // Down
            ||
            findPath(n,m,pathMatrix,backtrackMatrix,currentN,currentM - 1); // Left
        }
    }

    return false;
}


