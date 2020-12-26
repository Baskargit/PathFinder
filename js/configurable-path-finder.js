class ConfigurablePathFinder extends GridUi
{
    constructor(row = 5, col = 5)
    {
        super(row, col,0,"grid");

        // UI related variables for displaying traversedPaths in the grid
        this.traversedPaths = [];
        this.objKey = "configurablePathFinder";
        this.setCellTypeKey = this.objKey;

        // Variable for Backtracking purpose
        this.backtrackMatrix = [];

        // Source and Destination proerties
        this.sourceX = 0;
        this.sourceY = 0;
        this.destinationX = (this.rowCount - 1);
        this.destinationY = (this.colCount - 1);
        this.draggableSourceKey = "draggableSource";
        this.draggableDestinationKey = "draggableDestination";
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
                if (currentN == this.destinationY && currentM == this.destinationX) 
                {
                    // Destination found
                    return true;
                }

                backtrackMatrix[currentN][currentM] = true;

                if (currentN != this.sourceY || currentM != this.sourceX) 
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

    disableDragging()
    {
        $("." + this.draggableSourceKey).draggable({ disabled: true });
        $("." + this.draggableDestinationKey).draggable({ disabled: true });
    }

    enableDragging()
    {
        $("." + this.draggableSourceKey).draggable({ disabled: false });
        $("." + this.draggableDestinationKey).draggable({ disabled: false });
    }

    addDraggable()
    {
        // Update destination as per row and column values
        this.sourceX = 0;
        this.sourceY = 0;
        this.destinationY = this.rowCount - 1;
        this.destinationX = this.colCount - 1;

        // Update UI fields as per row and column values
        this.gridSource = this.sourceY + "_" + this.sourceX;
        this.gridDestination = this.destinationY + "_" + this.destinationX;
        
        // Make default source and destination as traversable in terms of UI
        $("#" + this.gridSource).css("background-color",this.colorConfig.nonWallColour);
        $("#" + this.gridDestination).css("background-color",this.colorConfig.nonWallColour);

        // Clone the existing source div element and create new draggable Source and Destination with all the required configurations
        var newDraggableSrc = $("#" + this.gridSource).clone().removeAttr("id").addClass(this.draggableSourceKey).draggable({
            containment: $("." + this.gridClassName),
            grid: [this.gridCellSize,this.gridCellSize],
            // If dragging stopped update the source accordingly
            stop: (event, ui) =>
            {
                // Map X cartesian co-ordinate with column in the matrix
                this.sourceX = (ui.position.left != 0) ? ui.position.left/this.gridCellSize : 0;
                // Map Y cartesian co-ordinate with row in the matrix
                this.sourceY = (ui.position.top != 0) ? ui.position.top/this.gridCellSize : 0;

                // Update the source position
                this.gridSource = this.sourceY + "_" + this.sourceX;

                console.log(this.sourceY + "," + this.sourceX);
            },
        });

        var newDraggableDest = $("#" + this.gridSource).clone().removeAttr("id").addClass(this.draggableDestinationKey).draggable({
            containment: $("." + this.gridClassName),
            grid: [this.gridCellSize,this.gridCellSize],
            // If dragging stopped update the destination accordingly
            stop: (event, ui) =>
            {
                // Map X cartesian co-ordinate with column in the matrix
                this.destinationX = (ui.position.left != 0) ? ((this.gridCellSize * (this.colCount - 1)) + ui.position.left)/this.gridCellSize : this.colCount - 1;
                // Map Y cartesian co-ordinate with row in the matrix
                this.destinationY = (ui.position.top != 0) ? ((this.gridCellSize * (this.rowCount - 1)) + ui.position.top)/this.gridCellSize: this.rowCount - 1;

                // Update destination position
                this.gridDestination = this.destinationY + "_" + this.destinationX;

                console.log(this.destinationY + "," + this.destinationX);
            },
        });
        
        // Make draggable source and destination without borders, so that it will look like contained.
        newDraggableSrc.css("background-color",this.colorConfig.sourceColor).css("border",0);
        newDraggableDest.css("background-color",this.colorConfig.destinationColor).css("border",0);

        // Append the draggable gridCell to their default position
        $("#" + this.gridSource).append(newDraggableSrc);
        $("#" + this.gridDestination).append(newDraggableDest);
    }
}

// Make sure first the DOM content is loaded => so that the order of the file load doesn't matter
document.addEventListener("DOMContentLoaded", function()
{
    // Instantiate SimplePathFinder object 
    // Note : All functionalities of the configurablePathFinder will going to use this object only
    var configurablePathFinder = new ConfigurablePathFinder();

    // Add this object to window object => so that upon dynamic html content generation it will be used when hoverover a cell event occurs over the grid
    window[configurablePathFinder.objKey] = configurablePathFinder;
    
    // Disable the Reset and Re-Run Animation button by default
    configurablePathFinder.miscConfig.loadButtonDefaults();
    
    // Draw the initial default size Grid 5 X 5
    configurablePathFinder.drawGrid();

    // Make source and destination as draggable
    configurablePathFinder.addDraggable();

    // RowCount input change
    document.getElementById("rowCount").addEventListener('input', function()
    {
        // Get new row count
        var parsed = parseInt($("#" + configurablePathFinder.miscConfig.rowCountInputId).val());
        
        if (parsed > 0 && parsed != configurablePathFinder.rowCount) 
        {
            // Update new RowCount value
            configurablePathFinder.rowCount = parsed;

            configurablePathFinder.updateGridConfiguration();

            // Make source and destination as draggable as per new grid size configuration
            configurablePathFinder.addDraggable();
        }
        
    });

    // ColumnCount input change
    document.getElementById("columnCount").addEventListener('input', function()
    {
        // Get new row count
        var parsed = parseInt($("#" + configurablePathFinder.miscConfig.columnCountInputId).val());
        
        if (parsed > 0 && parsed != configurablePathFinder.colCount) 
        {
            // Update new RowCount value
            configurablePathFinder.colCount = parsed;

            configurablePathFinder.updateGridConfiguration();

            // Make source and destination as draggable as per new grid size configuration
            configurablePathFinder.addDraggable();
        }
    });

    // FindPath button clicked
    document.getElementById("findPath").addEventListener('click', function()
    {
        // Disable buttons
        configurablePathFinder.miscConfig.disableButton(configurablePathFinder.miscConfig.findPathButtonId);
        configurablePathFinder.miscConfig.disableButton(configurablePathFinder.miscConfig.rowCountInputId);
        configurablePathFinder.miscConfig.disableButton(configurablePathFinder.miscConfig.columnCountInputId);

        // Update row and column values
        $("#" + configurablePathFinder.miscConfig.rowCountInputId).val(configurablePathFinder.rowCount);
        $("#" + configurablePathFinder.miscConfig.columnCountInputId).val(configurablePathFinder.colCount);

        // Initialize new matrix, so that Pathfinding will be possible.
        configurablePathFinder.backtrackMatrix = configurablePathFinder.createMatrix(false);

        // Clear previously traversed paths, for newer path configuration
        configurablePathFinder.clearTraversedPath();

        var isPathFound = configurablePathFinder.findPath(configurablePathFinder.rowCount,configurablePathFinder.colCount,configurablePathFinder.matrix,configurablePathFinder.backtrackMatrix,configurablePathFinder.sourceY,configurablePathFinder.sourceX);

        console.log("Is Pathfound : " + isPathFound);

        if (isPathFound) 
        {
            // Enable masking => So that the grid changes for the current configuration can be avoided
            configurablePathFinder.isMasked = true;

            // Disable draggable Source and Destination
            configurablePathFinder.disableDragging();

            // Animate traversed Paths
            configurablePathFinder.drawSourceToDestination(configurablePathFinder.traversedPaths);

            // Calculate time based on fwdCellToCellDelay configuration (In milliseconds)
            var timeTakenToDraw = (configurablePathFinder.animationConfig.fwdCellToCellDelay * configurablePathFinder.traversedPaths.length) + 500;

            var handler = window.setTimeout(function()
            {
                // Enable buttons once animation is done
                configurablePathFinder.miscConfig.enableButton(configurablePathFinder.miscConfig.reRunAnimationButtonId);
                configurablePathFinder.miscConfig.enableButton(configurablePathFinder.miscConfig.resetButtonId);
                configurablePathFinder.miscConfig.enableButton(configurablePathFinder.miscConfig.updateCurrentGridButtonId);

                clearTimeout(handler);
            },timeTakenToDraw);
        }
        else
        {
            configurablePathFinder.miscConfig.enableButton(configurablePathFinder.miscConfig.findPathButtonId);

            alert("No Path found");
        }
    });

    // Re-Run Animation button clicked
    document.getElementById("reRunAnimation").addEventListener('click', function()
    {
        // Disable both the Re-Run and Reset button to avoid unwanted glitches on UI while rendering (if user click other buttons, animations may vary and show weird animations)
        configurablePathFinder.miscConfig.disableButton(configurablePathFinder.miscConfig.reRunAnimationButtonId);
        configurablePathFinder.miscConfig.disableButton(configurablePathFinder.miscConfig.resetButtonId);
        configurablePathFinder.miscConfig.disableButton(configurablePathFinder.miscConfig.updateCurrentGridButtonId);

        // Just reverse animation
        // Function re-used with redrawing = false
        configurablePathFinder.drawDestinationToSource(configurablePathFinder.traversedPaths);

        // Calculate time based on revCellToCellDelay configuration (In milliseconds)
        var revTimeTakenToDraw = (configurablePathFinder.animationConfig.revCellToCellDelay * configurablePathFinder.traversedPaths.length) + 500;

        var revHandler = window.setTimeout(function()
        {
            // Draw the traversedpath again
            configurablePathFinder.drawSourceToDestination(configurablePathFinder.traversedPaths);

            // Calculate time based on fwdCellToCellDelay configuration (In milliseconds)
            var fwdTimeTakenToDraw = (configurablePathFinder.animationConfig.fwdCellToCellDelay * configurablePathFinder.traversedPaths.length) + 500;

            var fwdHandler = setTimeout(function() 
            {
                // Enable buttons once animation is done
                configurablePathFinder.miscConfig.enableButton(configurablePathFinder.miscConfig.reRunAnimationButtonId);
                configurablePathFinder.miscConfig.enableButton(configurablePathFinder.miscConfig.resetButtonId);
                configurablePathFinder.miscConfig.enableButton(configurablePathFinder.miscConfig.updateCurrentGridButtonId);
                
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
        configurablePathFinder.miscConfig.disableButton(configurablePathFinder.miscConfig.resetButtonId);
        configurablePathFinder.miscConfig.disableButton(configurablePathFinder.miscConfig.reRunAnimationButtonId);
        configurablePathFinder.miscConfig.disableButton(configurablePathFinder.miscConfig.updateCurrentGridButtonId);

        // Reset all the traversed path colour
        configurablePathFinder.drawDestinationToSource(configurablePathFinder.traversedPaths);

        // Calculate time based on revCellToCellDelay configuration (In milliseconds)
        var revTimeTakenToDraw = (configurablePathFinder.animationConfig.revCellToCellDelay * configurablePathFinder.traversedPaths.length) + 500;

        var revHandler = window.setTimeout(() =>
        {
            // Refresh the UI and logic variables
            configurablePathFinder.updateGridConfiguration();

            // Enable input for further modification
            configurablePathFinder.miscConfig.enableButton(configurablePathFinder.miscConfig.rowCountInputId);
            configurablePathFinder.miscConfig.enableButton(configurablePathFinder.miscConfig.columnCountInputId);

            // Disable masking for making changes in source matrix (or) maze
            configurablePathFinder.isMasked = false;

            // Make source and destination as draggable
            configurablePathFinder.addDraggable();

            // Clear the timeout
            clearTimeout(revHandler);
        },revTimeTakenToDraw);

    });

    // Update button clicked
    document.getElementById("updateCurrentGrid").addEventListener('click', function()
    {
        // Disbale buttons
        configurablePathFinder.miscConfig.disableButton(configurablePathFinder.miscConfig.updateCurrentGridButtonId);
        configurablePathFinder.miscConfig.disableButton(configurablePathFinder.miscConfig.resetButtonId);
        configurablePathFinder.miscConfig.disableButton(configurablePathFinder.miscConfig.reRunAnimationButtonId);

        // Reset all the traversed path colour
        configurablePathFinder.drawDestinationToSource(configurablePathFinder.traversedPaths);

        // Calculate time based on revCellToCellDelay configuration (In milliseconds)
        var revTimeTakenToDraw = (configurablePathFinder.animationConfig.revCellToCellDelay * configurablePathFinder.traversedPaths.length) + 500;

        var revHandler = window.setTimeout(() =>
        {
            // Enable masking for making changes in source matrix (or) maze
            configurablePathFinder.isMasked = false;

            // Enable input for further modification
            configurablePathFinder.miscConfig.loadButtonDefaults();

            // Enable Source and Destination dragging property
            configurablePathFinder.enableDragging();

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
                configurablePathFinder.animationConfig.fwdCellToCellDelay = 250 - (45 * (val - 5));
                configurablePathFinder.animationConfig.fwdTransitionDuration = 1 - (0.09 * (val - 5));

                configurablePathFinder.animationConfig.revCellToCellDelay = 50 - (5 * (val - 5));
            }
            else if (val < 5)
            {
                configurablePathFinder.animationConfig.fwdCellToCellDelay = 250 + (45 * (5 - val));
                configurablePathFinder.animationConfig.fwdTransitionDuration = 1 + (0.1 * (5 - val));
            }
            else
            {
                // Set Default speed
                configurablePathFinder.animationConfig.fwdTransitionDuration = 1; // Seconds
                configurablePathFinder.animationConfig.fwdCellToCellDelay = 250; // milliseconds

                configurablePathFinder.animationConfig.revTransitionDuration = 0.5; // Seconds
                configurablePathFinder.animationConfig.revCellToCellDelay = 50; // milliseconds
            }
        }
    });

});