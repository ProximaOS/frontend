#include "html_parser.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

Attribute* create_attribute(const char* name, const char* value) {
    Attribute* attr = malloc(sizeof(Attribute));
    attr->name = strdup(name);
    attr->value = strdup(value);
    attr->next = NULL;
    return attr;
}

Node* parse_html(const char* html) {
    // Implement your parsing logic here
    // This is just a stub, a real parser would be much more complex
    Node* root = malloc(sizeof(Node));
    root->tag = "html";
    root->content = "";
    root->attributes = NULL;
    root->children = NULL;
    root->next = NULL;
    return root;
}

Node* get_element_by_id(Node* root, const char* id) {
    // Implement finding element by id
    // This is just a stub, you'd need to traverse the tree and compare ids
    return NULL;
}

Node* query_selector(Node* root, const char* selector) {
    // Implement querying by selector
    // This is just a stub, you'd need to traverse the tree and match selectors
    return NULL;
}

Node* query_selector_all(Node* root, const char* selector) {
    // Implement querying all elements by selector
    // This is just a stub, you'd need to traverse the tree and match selectors
    return NULL;
}

Node* get_elements_by_class_name(Node* root, const char* class_name) {
    // Implement finding elements by class name
    // This is just a stub, you'd need to traverse the tree and compare class names
    return NULL;
}

char* get_attribute(Node* node, const char* attribute_name) {
    // Implement getting attribute value
    // This is just a stub, you'd need to traverse the attribute list and find the attribute
    return NULL;
}

void free_tree(Node* root) {
    if (root == NULL) return;
    free_tree(root->children);
    free_tree(root->next);
    Attribute* attr = root->attributes;
    while (attr != NULL) {
        Attribute* next = attr->next;
        free(attr->name);
        free(attr->value);
        free(attr);
        attr = next;
    }
    free(root);
}
