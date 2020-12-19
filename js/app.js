// Initialise required variables
var row = 5;
var column = 5;
var matrix = create2dArray(row,column);
var traversedMatrix = create2dArray(row,column,false);
var mask = false;

// Initialise colour variables
var sourceColor = "red";
var destinationColor = "green";
var wallColour = "black";
var nonWallColour = "transparent";
var traversedColor = "blue";
var gridColour = "blueviolet";

// Animation Oriented variables
var traversedPaths = [];
var fwdTransitionDuration = 1; // Seconds
var fwdCellToCellDelay = 250; // milliseconds
var revTransitionDuration = 0.5; // Seconds
var revCellToCellDelay = 50; // milliseconds

// DOM element centralized Id variables
var findPathButtonId = "findPath";
var reRunAnimationButtonId = "reRunAnimation";
var clearButtonId = "clear";
var rowCountInputId = "rowCount";
var columnCountInputId = "columnCount";

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
    // Not an alteration in matrix (or) Not masked (meaning, if user clicked 'FindPath' then no other alteration on the matrix is allowed)
    if (!mask && !window.event.altKey) 
    {
        var splitted = (posId != null) ? posId.split("_") : null ;

        if (splitted != null && splitted.length == 2) 
        {
            // If Position is not both the source and destination then update the data and UI element
            if (posId != "0_0" && splitted[0] + "_" + splitted[1] != (row - 1) + "_" + (column - 1)) 
            {
                // If ctrl key is pressed then make it Block or Wall (1)
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

function setTraverseCellAnimation(cellId,duration = fwdTransitionDuration) 
{
    if (cellId != null) 
    {
        $("#" + cellId).css("transition","background-color " + duration + "s" + " ease");
    }
}

function drawSourceToDestination(traverseColor = traversedColor,duration = fwdTransitionDuration,ctc = fwdCellToCellDelay)
{
    var fwdhandler = setInterval(function() 
    {
        if (fwdIndex >= traversedPaths.length) 
        {
            clearInterval(fwdhandler);
        }
        else
        {
            setCellColour(traversedPaths[fwdIndex],traverseColor);
            setTraverseCellAnimation(traversedPaths[fwdIndex],duration);
            fwdIndex++;            
        }
    } , ctc,fwdIndex = 0);
}

function drawDestinationToSource(traverseColor = traversedColor,duration = fwdTransitionDuration,ctc = fwdCellToCellDelay)
{
    var revHandler = setInterval(function() 
    { 
        if (revIndex < 0)
        {
            clearInterval(revHandler);
        }
        else
        {
            setCellColour(traversedPaths[revIndex],traverseColor);
            setTraverseCellAnimation(traversedPaths[revIndex],duration)
            revIndex--;
        }
    } , ctc,revIndex = traversedPaths.length - 1);
}

function disableButton(buttonId) 
{
    $('#' + buttonId).prop('disabled', true);
}

function enableButton(buttonId) 
{
    $('#' + buttonId).prop('disabled', false);
}

function clearTraversedPath() 
{
    // Remove all old references for traversed paths
    // https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
    traversedPaths.length = 0;    
}

function loadButtonDefaults() 
{
    disableButton(reRunAnimationButtonId);
    disableButton(clearButtonId);
    enableButton(findPathButtonId);
}

// Js eventlistener function block

document.addEventListener("DOMContentLoaded", function()
{
    // Disable the Reset and Re-Run Animation button by default
    loadButtonDefaults();

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
        column = (parsed > 2) ? parsed : column;
        matrix = create2dArray(row,column);
        traversedMatrix = create2dArray(row,column,false);
        drawGrid();
        setGridColours();
    });

    // FindPath button clicked
    document.getElementById("findPath").addEventListener('click', function()
    {
        // Enable masking
        mask = true;

        // Disable buttons
        disableButton(findPathButtonId);
        disableButton(rowCountInputId);
        disableButton(columnCountInputId);

        // Update row and column values
        $("#rowCount").val(row);
        $("#columnCount").val(column);

        var isPathFound = findPath(row,column,matrix,traversedMatrix,0,0);

        console.log("Is Pathfound : " + isPathFound);

        if (isPathFound) 
        {
            // Animate traversed Paths
            drawSourceToDestination(traversedColor,fwdTransitionDuration,fwdCellToCellDelay);

            // Calculate time based on fwdCellToCellDelay configuration (In milliseconds)
            var timeTakenToDraw = (fwdCellToCellDelay * traversedPaths.length) + 500;

            var handler = window.setTimeout(function()
            {
                // Enable buttons once animation is done
                enableButton(reRunAnimationButtonId);
                enableButton(clearButtonId);
                clearTimeout(handler);
                console.log("set timeout done : " + timeTakenToDraw);
            },timeTakenToDraw);
        }
        else
        {
            enableButton(findPathButtonId);
            alert("No Path found");
        }
    });

    // Re-Run Animation button clicked
    document.getElementById("reRunAnimation").addEventListener('click', function()
    {
        // Disable both the Re-Run and Reset button to avoid unwanted glitches on UI while rendering (if user click other buttons, animations may vary and show weird animations)
        disableButton(reRunAnimationButtonId);
        disableButton(clearButtonId);

        // Just reverse animation
        // Function re-used with redrawing = false
        drawDestinationToSource("transparent",revTransitionDuration,revCellToCellDelay);

        // Calculate time based on revCellToCellDelay configuration (In milliseconds)
        var revTimeTakenToDraw = (revCellToCellDelay * traversedPaths.length) + 500;

        var revHandler = window.setTimeout(function()
        {
            // Draw the traversedpath again
            drawSourceToDestination(traversedColor,fwdTransitionDuration,fwdCellToCellDelay);

            // Calculate time based on fwdCellToCellDelay configuration (In milliseconds)
            var fwdTimeTakenToDraw = (fwdCellToCellDelay * traversedPaths.length) + 500;

            var fwdHandler = setTimeout(function() 
            {
                // Enable buttons once animation is done
                enableButton(reRunAnimationButtonId);
                enableButton(clearButtonId);
                
                // Clear the timeout
                clearTimeout(fwdHandler);
            },fwdTimeTakenToDraw);

            // Clear the timeout
            clearTimeout(revHandler);
        },revTimeTakenToDraw);
    });

    // Clear button clicked
    document.getElementById("clear").addEventListener('click', function()
    {
        disableButton(clearButtonId);
        disableButton(reRunAnimationButtonId);

        // Reset all the traversed path colour
        drawDestinationToSource("transparent",revTransitionDuration,revCellToCellDelay);

        // Calculate time based on revCellToCellDelay configuration (In milliseconds)
        var revTimeTakenToDraw = (revCellToCellDelay * traversedPaths.length) + 500;

        var revHandler = window.setTimeout(function()
        {
            // Initialize new matrix with no walls configuration
            matrix = create2dArray(row,column,0);

            // Initialize traversedMatrix
            traversedMatrix = create2dArray(row,column,false);

            // Clear traversedPath array {important}
            clearTraversedPath();

            // Redraw the grid
            drawGrid();
            // Set Initial Colors
            setGridColours();

            // Load deafult enabled buttons
            loadButtonDefaults();

            // Enable input for further modification
            enableButton(rowCountInputId);
            enableButton(columnCountInputId);

            // Disable masking for making changes in source matrix (or) maze
            mask = false;

            // Clear the timeout
            clearTimeout(revHandler);
        },revTimeTakenToDraw);
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

/**
Notes => Run code b/t intervals

setTimeout(function {},time) => onetime
setInterval(function {},timeInMillseconds) => run continuously

*/

