import React, { useEffect, useState, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  Background,
  useKeyPress
} from "react-flow-renderer";
import NodesPanel from "./NodesPanel";
import TextNode from "./NodesTypes/TextNode";
import SettingsPanel from "./SettingsPanel";
import "../styles/FlowBuilder.css";

const nodeTypes = { textNode: TextNode };

const getId = () => `dndnode_${+new Date()}`;

const FlowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [error, setError] = useState("");
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);


  const deleteKeyPressed = useKeyPress("Delete");

  const onConnect = (params) =>
    setEdges((eds) =>
      addEdge({ ...params, markerEnd: { type: "arrowclosed" } }, eds)
    );

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const type = event.dataTransfer.getData("application/reactflow");
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });
    const newNode = {
      id: getId(),
      type,
      position,
      data: { text: "New Message" },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const onLoad = (rfi) => setReactFlowInstance(rfi);

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const handleTextChange = (event) => {
    const newText = event.target.value;
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { text: newText } }
          : node
      )
    );
    // Also update the selectedNode state to ensure re-rendering
    setSelectedNode((prevNode) => ({
      ...prevNode,
      data: { ...prevNode.data, text: newText },
    }));
  };

  const validateFlow = () => {
    const nodesWithEmptyTargets = nodes.filter(
      (node) => !edges.some((edge) => edge.source === node.id)
    );
    if (nodesWithEmptyTargets.length > 1) {
      return "Error: Multiple nodes have empty target handles";
    }
    return null;
  };

  const onSave = () => {
    const validationError = validateFlow();
    if (validationError) {
      setError(validationError);
    } else {
      setError("");
      const flowData = { nodes, edges };
      console.log("Saved Flow:", flowData);
      setSelectedNode(null);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "Delete" && selectedElement) {
      if (selectedElement.id) {
        // It's a node
        setNodes((nds) => nds.filter((node) => node.id !== selectedElement.id));
        setEdges((eds) =>
          eds.filter(
            (edge) =>
              edge.source !== selectedElement.id &&
              edge.target !== selectedElement.id
          )
        );
      } else {
        // It's an edge
        setEdges((eds) => eds.filter((edge) => edge.id !== selectedElement.id));
      }
      setSelectedElement(null);
      setSelectedNode(null);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedElement]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ChatBot Flow Builder</h1>
        <button onClick={onSave}>Save Changes</button>
      </header>
      <div className="dndflow">
        <ReactFlowProvider>
          <div className="reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={onLoad}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </div>
          {selectedNode ? (
            <SettingsPanel
              selectedNode={selectedNode}
              handleTextChange={handleTextChange}
              onBack={() => setSelectedNode(null)}
            />
          ) : (
            <NodesPanel
              onDragStart={(event, nodeType) =>
                event.dataTransfer.setData("application/reactflow", nodeType)
              }
            />
          )}
          {error && <div className="error">{error}</div>}
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default FlowBuilder;
