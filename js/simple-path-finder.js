class SimplePathFinder extends GridUi
{
    constructor(row = 5, col = 5)
    {
        // Call base constructor with all the required parameters
        super(row, col,0,"grid");

        // Common Objects
        this.miscConfig = new MiscConfig();

        // UI related variables for displaying traversedPaths in the grid
        this.traversedPaths = [];

        // Variable for Backtracking purpose
        this.backtrackMatrix = [];
    }

    updateGridConfiguration()
    {
        // Update matrix as per new RowCount value with default value 0
        this.updateMatrix(this.rowCount,this.colCount,0);

        // Update the grid UI as per new RowCount value
        this.drawGrid();

        // Disable the Reset and Re-Run Animation button by default
        this.miscConfig.loadButtonDefaults();

        // console.log(this);
    }

    clearTraversedPath() 
    {
        // Remove all old references for traversed paths
        // https://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript
        this.traversedPaths.length = 0;    
    }

    // Find whether a single path available (or) not
    // If path found  return 'true' otherwise return 'false'
    findPath(n,m,pathMatrix,backtrackMatrix,currentN,currentM)
    {
        if ((currentN >= 0 && currentM >= 0) && (currentN < n && currentM < m)) 
        {
            // Current cell should not be traversed and also be a traversable path (0)
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
                    this.traversedPaths.push(currentN + "_" + currentM);
                }

                return this.findPath(n,m,pathMatrix,backtrackMatrix,currentN - 1,currentM) // UP
                ||
                this.findPath(n,m,pathMatrix,backtrackMatrix,currentN,currentM + 1) // Right
                ||
                this.findPath(n,m,pathMatrix,backtrackMatrix,currentN + 1,currentM) // Down
                ||
                this.findPath(n,m,pathMatrix,backtrackMatrix,currentN,currentM - 1); // Left
            }
        }

        return false;
    }
    
}


// Make sure first the DOM content is loaded => so that the order of the file load doesn't matter
document.addEventListener("DOMContentLoaded", function()
{
    // Instantiate SimplePathFinder object 
    // Note : All functionalities of the simplePathFinder will going to use this object only
    var simplePathFinder = new SimplePathFinder();

    // Add this object to window object => so that upon dynamic html content generation it will be used when hoverover a cell event occurs over the grid
    window.simplePathFinder = simplePathFinder;
    
    // Disable the Reset and Re-Run Animation button by default
    simplePathFinder.miscConfig.loadButtonDefaults();
    
    // Draw the initial default size Grid 5 X 5
    simplePathFinder.drawGrid();

    console.log(simplePathFinder);

    // RowCount input change
    document.getElementById("rowCount").addEventListener('input', function()
    {
        // Get new row count
        var parsed = parseInt($("#" + simplePathFinder.miscConfig.rowCountInputId).val());
        
        if (parsed > 0 && parsed != simplePathFinder.rowCount) 
        {
            // Update new RowCount value
            simplePathFinder.rowCount = parsed;

            simplePathFinder.updateGridConfiguration();
        }
        
    });

    // ColumnCount input change
    document.getElementById("columnCount").addEventListener('input', function()
    {
        // Get new row count
        var parsed = parseInt($("#" + simplePathFinder.miscConfig.columnCountInputId).val());
        
        if (parsed > 0 && parsed != simplePathFinder.colCount) 
        {
            // Update new RowCount value
            simplePathFinder.colCount = parsed;

            simplePathFinder.updateGridConfiguration();
        }
    });

    // FindPath button clicked
    document.getElementById("findPath").addEventListener('click', function()
    {
        // Disable buttons
        simplePathFinder.miscConfig.disableButton(simplePathFinder.miscConfig.findPathButtonId);
        simplePathFinder.miscConfig.disableButton(simplePathFinder.miscConfig.rowCountInputId);
        simplePathFinder.miscConfig.disableButton(simplePathFinder.miscConfig.columnCountInputId);

        // Update row and column values
        $("#" + simplePathFinder.miscConfig.rowCountInputId).val(simplePathFinder.rowCount);
        $("#" + simplePathFinder.miscConfig.columnCountInputId).val(simplePathFinder.colCount);

        // Initialize new matrix, so that Pathfinding will be possible.
        simplePathFinder.backtrackMatrix = simplePathFinder.createMatrix(false);

        // Clear previously traversed paths, for newer path configuration
        simplePathFinder.clearTraversedPath();

        var isPathFound = simplePathFinder.findPath(simplePathFinder.rowCount,simplePathFinder.colCount,simplePathFinder.matrix,simplePathFinder.backtrackMatrix,0,0);

        console.log("Is Pathfound : " + isPathFound);

        if (isPathFound) 
        {
            // Enable masking => So that the grid changes for the current configuration can be avoided
            simplePathFinder.isMasked = true;

            // Animate traversed Paths
            simplePathFinder.drawSourceToDestination(simplePathFinder.traversedPaths);

            // Calculate time based on fwdCellToCellDelay configuration (In milliseconds)
            var timeTakenToDraw = (simplePathFinder.animationConfig.fwdCellToCellDelay * simplePathFinder.traversedPaths.length) + 500;

            var handler = window.setTimeout(function()
            {
                // Enable buttons once animation is done
                simplePathFinder.miscConfig.enableButton(simplePathFinder.miscConfig.reRunAnimationButtonId);
                simplePathFinder.miscConfig.enableButton(simplePathFinder.miscConfig.resetButtonId);
                simplePathFinder.miscConfig.enableButton(simplePathFinder.miscConfig.updateCurrentGridButtonId);

                clearTimeout(handler);
            },timeTakenToDraw);
        }
        else
        {
            simplePathFinder.miscConfig.enableButton(simplePathFinder.miscConfig.findPathButtonId);

            alert("No Path found");
        }
    });

    // Re-Run Animation button clicked
    document.getElementById("reRunAnimation").addEventListener('click', function()
    {
        // Disable both the Re-Run and Reset button to avoid unwanted glitches on UI while rendering (if user click other buttons, animations may vary and show weird animations)
        simplePathFinder.miscConfig.disableButton(simplePathFinder.miscConfig.reRunAnimationButtonId);
        simplePathFinder.miscConfig.disableButton(simplePathFinder.miscConfig.resetButtonId);
        simplePathFinder.miscConfig.disableButton(simplePathFinder.miscConfig.updateCurrentGridButtonId);

        // Just reverse animation
        // Function re-used with redrawing = false
        simplePathFinder.drawDestinationToSource(simplePathFinder.traversedPaths);

        // Calculate time based on revCellToCellDelay configuration (In milliseconds)
        var revTimeTakenToDraw = (simplePathFinder.animationConfig.revCellToCellDelay * simplePathFinder.traversedPaths.length) + 500;

        var revHandler = window.setTimeout(function()
        {
            // Draw the traversedpath again
            simplePathFinder.drawSourceToDestination(simplePathFinder.traversedPaths);

            // Calculate time based on fwdCellToCellDelay configuration (In milliseconds)
            var fwdTimeTakenToDraw = (simplePathFinder.animationConfig.fwdCellToCellDelay * simplePathFinder.traversedPaths.length) + 500;

            var fwdHandler = setTimeout(function() 
            {
                // Enable buttons once animation is done
                simplePathFinder.miscConfig.enableButton(simplePathFinder.miscConfig.reRunAnimationButtonId);
                simplePathFinder.miscConfig.enableButton(simplePathFinder.miscConfig.resetButtonId);
                simplePathFinder.miscConfig.enableButton(simplePathFinder.miscConfig.updateCurrentGridButtonId);
                
                // Clear the timeout
                clearTimeout(fwdHandler);
            },fwdTimeTakenToDraw);

            // Clear the timeout
            clearTimeout(revHandler);
        },revTimeTakenToDraw);
    });

    // Reset button clicked
    document.getElementById("reset").addEventListener('click', function()
    {
        simplePathFinder.miscConfig.disableButton(simplePathFinder.miscConfig.resetButtonId);
        simplePathFinder.miscConfig.disableButton(simplePathFinder.miscConfig.reRunAnimationButtonId);
        simplePathFinder.miscConfig.disableButton(simplePathFinder.miscConfig.updateCurrentGridButtonId);

        // Reset all the traversed path colour
        simplePathFinder.drawDestinationToSource(simplePathFinder.traversedPaths);

        // Calculate time based on revCellToCellDelay configuration (In milliseconds)
        var revTimeTakenToDraw = (simplePathFinder.animationConfig.revCellToCellDelay * simplePathFinder.traversedPaths.length) + 500;

        var revHandler = window.setTimeout(() =>
        {
            // Refresh the UI and logic variables
            simplePathFinder.updateGridConfiguration();

            // Enable input for further modification
            simplePathFinder.miscConfig.enableButton(simplePathFinder.miscConfig.rowCountInputId);
            simplePathFinder.miscConfig.enableButton(simplePathFinder.miscConfig.columnCountInputId);

            // Disable masking for making changes in source matrix (or) maze
            simplePathFinder.isMasked = false;

            // Clear the timeout
            clearTimeout(revHandler);
        },revTimeTakenToDraw);

    });

    // Update button clicked
    document.getElementById("updateCurrentGrid").addEventListener('click', function()
    {
        // Disbale buttons
        simplePathFinder.miscConfig.disableButton(simplePathFinder.miscConfig.updateCurrentGridButtonId);
        simplePathFinder.miscConfig.disableButton(simplePathFinder.miscConfig.resetButtonId);
        simplePathFinder.miscConfig.disableButton(simplePathFinder.miscConfig.reRunAnimationButtonId);

        // Reset all the traversed path colour
        simplePathFinder.drawDestinationToSource(simplePathFinder.traversedPaths);

        // Calculate time based on revCellToCellDelay configuration (In milliseconds)
        var revTimeTakenToDraw = (simplePathFinder.animationConfig.revCellToCellDelay * simplePathFinder.traversedPaths.length) + 500;

        var revHandler = window.setTimeout(() =>
        {
            // Enable masking for making changes in source matrix (or) maze
            simplePathFinder.isMasked = false;

            // Enable input for further modification
            simplePathFinder.miscConfig.loadButtonDefaults();

            // Clear the timeout
            clearTimeout(revHandler);
        },revTimeTakenToDraw);
    });

    // When slider value changed
    document.getElementById("animationSpeed").addEventListener('click', function()
    {
        var val = $("#animationSpeed").val();

        if (val != null && val >= 1 && val <= 10) 
        {
            if (val > 5) 
            {
                simplePathFinder.animationConfig.fwdCellToCellDelay = 250 - (45 * (val - 5));
                simplePathFinder.animationConfig.fwdTransitionDuration = 1 - (0.09 * (val - 5));

                simplePathFinder.animationConfig.revCellToCellDelay = 50 - (5 * (val - 5));
            }
            else if (val < 5)
            {
                simplePathFinder.animationConfig.fwdCellToCellDelay = 250 + (45 * (5 - val));
                simplePathFinder.animationConfig.fwdTransitionDuration = 1 + (0.1 * (5 - val));
            }
            else
            {
                // Set Default speed
                simplePathFinder.animationConfig.fwdTransitionDuration = 1; // Seconds
                simplePathFinder.animationConfig.fwdCellToCellDelay = 250; // milliseconds

                simplePathFinder.animationConfig.revTransitionDuration = 0.5; // Seconds
                simplePathFinder.animationConfig.revCellToCellDelay = 50; // milliseconds
            }
        }
    });

});