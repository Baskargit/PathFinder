// Initialise required variables
var row = 5;
var column = 5;
var matrix = create2dArray(row,column);

// Initialise colour variables
var sourceColor = "red";
var destinationColor = "green";
var wallColour = "black";
var nonWallColour = "transparent";
var traversedColor = "blue";
var gridColour = "blueviolet";

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

    $(".grid").append(gridContent);
}

function create2dArray(n = 1,m = 1) 
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
            matrix[i][j] = 0;
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

function setCellColour(cellId,colour = "transparent") 
{
    if (cellId != null) 
    {
        $("#" + cellId).css("background-color",colour);
    }    
}

// Js eventlistener function block

document.addEventListener("DOMContentLoaded", function()
{
    // RowCount input change
    document.getElementById("rowCount").addEventListener('input', function()
    {
        row = ($("#rowCount").val() > 0) ? $("#rowCount").val() : row;
        matrix = create2dArray(row,column);
        drawGrid();
        setGridColours();
    });

    // ColumnCount input change
    document.getElementById("columnCount").addEventListener('input', function()
    {
        column = ($("#columnCount").val() > 0) ? $("#columnCount").val() : column;
        matrix = create2dArray(row,column);
        drawGrid();
        setGridColours();
    });
});

// Jquery functions


